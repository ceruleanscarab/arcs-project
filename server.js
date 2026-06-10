const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// JWT Secret - production must provide a stable secret so sessions survive restarts.
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.error("JWT_SECRET is required in production.");
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-arcs-secret-change-me";
const JWT_EXPIRY = "24h";

// Rate limiting store
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 5; // Max 5 requests per window

const root = __dirname;
const port = Number(process.env.PORT || 4177);
const dataDir = process.env.DATA_DIR || root;
const profilesFile = path.join(dataDir, "profiles.json");
const resetTokensFile = path.join(dataDir, "reset-tokens.json");
const coversDir = path.join(dataDir, "covers");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load profiles from file or initialize empty
let profiles = {};
try {
  if (fs.existsSync(profilesFile)) {
    profiles = JSON.parse(fs.readFileSync(profilesFile, "utf8"));
  }
} catch (error) {
  console.error("Error loading profiles:", error.message);
  profiles = {};
}

// Load reset tokens from file or initialize empty
let resetTokens = {};
try {
  if (fs.existsSync(resetTokensFile)) {
    resetTokens = JSON.parse(fs.readFileSync(resetTokensFile, "utf8"));
  }
} catch (error) {
  console.error("Error loading reset tokens:", error.message);
  resetTokens = {};
}

// Helper function to save profiles
function saveProfiles() {
  try {
    fs.writeFileSync(profilesFile, JSON.stringify(profiles, null, 2));
  } catch (error) {
    console.error("Error saving profiles:", error.message);
  }
}

// Helper function to save reset tokens
function saveResetTokens() {
  try {
    fs.writeFileSync(resetTokensFile, JSON.stringify(resetTokens, null, 2));
  } catch (error) {
    console.error("Error saving reset tokens:", error.message);
  }
}

// Ensure covers directory exists
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

// Helper function to generate a filename from URL
function getCoverFilename(imageUrl) {
  const hash = crypto.createHash("md5").update(imageUrl).digest("hex");
  const ext = path.extname(new URL(imageUrl).pathname) || ".jpg";
  return `${hash}${ext}`;
}

// Helper function to hash password
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Helper function to verify password
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Helper function to generate JWT token
function generateToken(email) {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

// Helper function to verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Extract and verify the Bearer token from a request.
// Returns the decoded payload on success, or sends 401 and returns null.
function requireAuth(request, response) {
  const auth = request.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    send(response, 401, JSON.stringify({ error: "Authentication required." }));
    return null;
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    send(response, 401, JSON.stringify({ error: "Invalid or expired token. Please log in again." }));
    return null;
  }
  return decoded;
}

// Helper function to generate sync name
function generateSyncName() {
  return `arcs-${crypto.randomBytes(8).toString("hex")}`;
}

// Helper function to generate reset token
function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Rate limiting function
function checkRateLimit(identifier) {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW;
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  record.count++;
  return true;
}

// Input validation function
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateString(input, maxLength = 255) {
  return typeof input === 'string' && input.length <= maxLength && input.length > 0;
}

function privateProxyAllowed() {
  return process.env.ALLOW_PRIVATE_PROXY === "true" || process.env.NODE_ENV !== "production";
}

function isPrivateOrLocalHost(hostname) {
  const h = String(hostname || "").toLowerCase().replace(/^\[|\]$/g, ""); // strip IPv6 brackets
  // Loopback / localhost
  if (["localhost", "127.0.0.1", "::1", "0:0:0:0:0:0:0:1", "0.0.0.0"].includes(h)) return true;
  // IPv4-mapped IPv6 loopback  ::ffff:127.x.x.x
  if (/^::ffff:127\./.test(h)) return true;
  // RFC-1918 private ranges
  if (h.startsWith("192.168.")) return true;
  if (h.startsWith("10.")) return true;
  const m172 = h.match(/^172\.(\d+)\./);
  if (m172 && Number(m172[1]) >= 16 && Number(m172[1]) <= 31) return true;
  // Link-local (169.254.x.x) — covers AWS/GCP/Azure IMDS at 169.254.169.254
  if (h.startsWith("169.254.")) return true;
  // IPv6 link-local fe80::/10
  if (h.startsWith("fe80:")) return true;
  // IPv6 unique-local fc00::/7
  if (/^f[cd]/i.test(h)) return true;
  return false;
}

// Sanitize filename to prevent path traversal
function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// Helper function to send email (placeholder - requires email service configuration)
async function sendEmail(to, subject, text) {
  // Placeholder for email functionality. Do not claim delivery unless enabled.
  console.log(`[EMAIL] To: ${to}, Subject: ${subject}, Body: ${text}`);
  return {
    success: process.env.EMAIL_ENABLED === "true",
    message: process.env.EMAIL_ENABLED === "true" ? "Email sent." : "Email is not configured; message logged on server."
  };
}

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff"
};

function send(response, status, body, type = "application/json") {
  const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:4177', 'http://127.0.0.1:4177'];
  const origin = response.req?.headers?.origin;
  
  const corsHeaders = {
    "Content-Type": type,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  };
  
  // Add CSP headers for HTML responses
  if (type === "text/html") {
    corsHeaders["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;";
  }
  
  if (allowedOrigins.includes(origin) || !origin) {
    corsHeaders["Access-Control-Allow-Origin"] = origin || allowedOrigins[0];
  }
  
  response.writeHead(status, corsHeaders);
  response.end(body);
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        reject(new Error("Request body is too large."));
      }
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("Request body is not valid JSON."));
      }
    });
  });
}

async function proxyKomga(request, response) {
  try {
    const payload = await readJson(request);
    const baseUrl = String(payload.baseUrl || "").replace(/\/+$/, "");
    const apiPath = String(payload.path || "");
    const username = String(payload.username || "");
    const password = String(payload.password || "");

    if (!baseUrl || !apiPath.startsWith("/api/") || !username || !password) {
      send(response, 400, JSON.stringify({ error: "Komga proxy settings are incomplete." }));
      return;
    }

    // SSRF protection: Validate URL
    try {
      const url = new URL(baseUrl);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        send(response, 400, JSON.stringify({ error: "Invalid URL protocol. Only http and https are allowed." }));
        return;
      }
      const hostname = url.hostname;
      if (!privateProxyAllowed() && isPrivateOrLocalHost(hostname)) {
        send(response, 400, JSON.stringify({ error: "Private-network proxying is disabled. Set ALLOW_PRIVATE_PROXY=true for trusted self-hosted Komga/Mylar servers." }));
        return;
      }
    } catch (error) {
      send(response, 400, JSON.stringify({ error: "Invalid URL format." }));
      return;
    }

    const auth = Buffer.from(`${username}:${password}`, "utf8").toString("base64");
    const komgaResponse = await fetch(`${baseUrl}${apiPath}`, {
      method: payload.method || "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`
      },
      body: payload.body ? JSON.stringify(payload.body) : undefined,
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    const text = await komgaResponse.text();
    send(
      response,
      komgaResponse.status,
      text || JSON.stringify({ ok: komgaResponse.ok }),
      komgaResponse.headers.get("content-type") || "application/json"
    );
  } catch (error) {
    send(response, 502, JSON.stringify({ error: error.message || "Komga proxy failed." }));
  }
}

async function proxyComicVine(request, response) {
  try {
    const payload = await readJson(request);
    const apiKey = String(payload.apiKey || "").trim();
    const apiPath = String(payload.path || "").replace(/^\/+/, "");
    const params = payload.params && typeof payload.params === "object" ? payload.params : {};

    if (!apiKey || !apiPath || apiPath.includes("..")) {
      send(response, 400, JSON.stringify({ error: "Comic Vine API key and valid path are required." }));
      return;
    }

    const comicVineUrl = new URL(`https://comicvine.gamespot.com/api/${apiPath}`);
    comicVineUrl.searchParams.set("api_key", apiKey);
    comicVineUrl.searchParams.set("format", "json");
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        comicVineUrl.searchParams.set(key, String(value));
      }
    });

    const comicVineResponse = await fetch(comicVineUrl, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "ARCS Comic Tracker"
      },
      signal: AbortSignal.timeout(12000)
    });

    const text = await comicVineResponse.text();
    send(
      response,
      comicVineResponse.status,
      text || JSON.stringify({ error: "Comic Vine returned an empty response." }),
      comicVineResponse.headers.get("content-type") || "application/json"
    );
  } catch (error) {
    send(response, 502, JSON.stringify({ error: error.message || "Comic Vine proxy failed." }));
  }
}

async function proxyGcd(request, response) {
  try {
    const payload = await readJson(request);
    const apiPath = String(payload.path || "").replace(/^\/+/, "");

    if (!apiPath || apiPath.includes("..")) {
      send(response, 400, JSON.stringify({ error: "Valid GCD API path is required." }));
      return;
    }

    const gcdUrl = new URL(`https://www.comics.org/api/${apiPath}`);

    const gcdResponse = await fetch(gcdUrl, {
      headers: { "Accept": "application/json", "User-Agent": "ARCS Comic Tracker" },
      signal: AbortSignal.timeout(12000)
    });

    const text = await gcdResponse.text();
    send(response, gcdResponse.status, text || JSON.stringify({ error: "GCD returned an empty response." }),
      gcdResponse.headers.get("content-type") || "application/json");
  } catch (error) {
    send(response, 502, JSON.stringify({ error: error.message || "GCD proxy failed." }));
  }
}

async function proxyMarvel(request, response) {
  try {
    const payload = await readJson(request);
    const apiPath = String(payload.path || "").replace(/^\/+/, "");

    if (!apiPath || apiPath.includes("..")) {
      send(response, 400, JSON.stringify({ error: "Valid Marvel API path is required." }));
      return;
    }

    const marvelUrl = new URL(`https://marvel.emreparker.com/v1/${apiPath}`);

    const marvelResponse = await fetch(marvelUrl, {
      headers: { "Accept": "application/json", "User-Agent": "ARCS Comic Tracker" },
      signal: AbortSignal.timeout(12000)
    });

    const text = await marvelResponse.text();
    send(response, marvelResponse.status, text || JSON.stringify({ error: "Marvel API returned an empty response." }),
      marvelResponse.headers.get("content-type") || "application/json");
  } catch (error) {
    send(response, 502, JSON.stringify({ error: error.message || "Marvel proxy failed." }));
  }
}

async function proxyMylar(request, response) {
  try {
    const payload = await readJson(request);
    const baseUrl = String(payload.baseUrl || "").replace(/\/+$/, "");
    const apiPath = String(payload.path || "");
    const apiKey = String(payload.apiKey || "");
    const httpUser = String(payload.httpUser || "");
    const httpPass = String(payload.httpPass || "");

    if (!baseUrl || !apiPath.startsWith("/api") || !apiKey) {
      send(response, 400, JSON.stringify({ error: "Mylar3 proxy settings are incomplete." }));
      return;
    }

    // SSRF protection: Validate URL
    try {
      const url = new URL(baseUrl);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        send(response, 400, JSON.stringify({ error: "Invalid URL protocol. Only http and https are allowed." }));
        return;
      }
      const hostname = url.hostname;
      if (!privateProxyAllowed() && isPrivateOrLocalHost(hostname)) {
        send(response, 400, JSON.stringify({ error: "Private-network proxying is disabled. Set ALLOW_PRIVATE_PROXY=true for trusted self-hosted Komga/Mylar servers." }));
        return;
      }
    } catch (error) {
      send(response, 400, JSON.stringify({ error: "Invalid URL format." }));
      return;
    }

    // Mylar3 requires apikey in query string (standard ?cmd= API).
    // Also send as X-Api-Key header for newer REST-style endpoints.
    const mylarUrlObj = new URL(`${baseUrl}${apiPath}`);
    mylarUrlObj.searchParams.set("apikey", apiKey);
    const mylarUrl = mylarUrlObj.toString();
    console.log(`[Mylar proxy] ${payload.method || "GET"} ${mylarUrl.replace(/apikey=[^&]+/, "apikey=***")}${httpUser ? " (HTTP auth)" : ""}`);
    const mylarHeaders = {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey
    };
    if (httpUser) {
      const encoded = Buffer.from(`${httpUser}:${httpPass}`).toString("base64");
      mylarHeaders["Authorization"] = `Basic ${encoded}`;
    }
    const mylarResponse = await fetch(mylarUrl, {
      method: payload.method || "GET",
      headers: mylarHeaders,
      body: payload.body ? JSON.stringify(payload.body) : undefined,
      signal: AbortSignal.timeout(15000)
    });

    const text = await mylarResponse.text();
    console.log(`[Mylar proxy] response ${mylarResponse.status}: ${text.substring(0, 200)}`);
    send(
      response,
      mylarResponse.status,
      text || JSON.stringify({ ok: mylarResponse.ok }),
      mylarResponse.headers.get("content-type") || "application/json"
    );
  } catch (error) {
    console.error(`[Mylar proxy] error: ${error.message}`);
    send(response, 502, JSON.stringify({ error: error.message || "Mylar3 proxy failed." }));
  }
}

async function handleCoverRequest(request, response) {
  const url = new URL(request.url, `http://localhost:${port}`);
  const requestPath = url.pathname;

  if (requestPath === "/api/covers/upload" && request.method === "POST") {
    try {
      const payload = await readJson(request);
      const { imageUrl, imageData } = payload;

      if (!imageUrl || !imageData) {
        send(response, 400, JSON.stringify({ error: "Image URL and data are required." }));
        return;
      }

      // Validate image data size (max 5MB)
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
      if (base64Data.length > 5_000_000) {
        send(response, 400, JSON.stringify({ error: "Image size exceeds maximum limit of 5MB." }));
        return;
      }

      // Validate image type
      if (!imageData.startsWith('data:image/')) {
        send(response, 400, JSON.stringify({ error: "Invalid image format. Only images are allowed." }));
        return;
      }

      const filename = getCoverFilename(imageUrl);
      const sanitizedFilename = sanitizeFilename(filename);
      const filepath = path.join(coversDir, sanitizedFilename);

      const buffer = Buffer.from(base64Data, "base64");
      fs.writeFileSync(filepath, buffer);

      send(response, 200, JSON.stringify({ success: true, filename: sanitizedFilename }));
    } catch (error) {
      send(response, 500, JSON.stringify({ error: "An error occurred while saving cover." }));
    }
    return;
  }

  if (requestPath === "/api/covers/check" && request.method === "POST") {
    try {
      const payload = await readJson(request);
      const { imageUrl } = payload;

      if (!imageUrl) {
        send(response, 400, JSON.stringify({ error: "Image URL is required." }));
        return;
      }

      const filename = getCoverFilename(imageUrl);
      const sanitizedFilename = sanitizeFilename(filename);
      const filepath = path.join(coversDir, sanitizedFilename);

      if (fs.existsSync(filepath)) {
        send(response, 200, JSON.stringify({ exists: true, filename: sanitizedFilename }));
      } else {
        send(response, 200, JSON.stringify({ exists: false }));
      }
    } catch (error) {
      send(response, 500, JSON.stringify({ error: "An error occurred while checking cover." }));
    }
    return;
  }

  if (requestPath.startsWith("/api/covers/image/") && request.method === "GET") {
    try {
      const filename = requestPath.split("/").pop();
      const sanitizedFilename = sanitizeFilename(filename);
      const filepath = path.join(coversDir, sanitizedFilename);

      if (!fs.existsSync(filepath)) {
        send(response, 404, JSON.stringify({ error: "Cover not found." }));
        return;
      }

      const ext = path.extname(sanitizedFilename).toLowerCase();
      const contentType = ext === ".png" ? "image/png" : ext === ".gif" ? "image/gif" : "image/jpeg";

      const imageBuffer = fs.readFileSync(filepath);
      send(response, 200, imageBuffer, contentType);
    } catch (error) {
      send(response, 500, JSON.stringify({ error: "An error occurred while serving cover." }));
    }
    return;
  }

  if (requestPath === "/api/covers/fetch" && request.method === "POST") {
    try {
      const payload = await readJson(request);
      const { imageUrl } = payload;

      if (!imageUrl) {
        send(response, 400, JSON.stringify({ error: "Image URL is required." }));
        return;
      }

      let parsedUrl;
      try {
        parsedUrl = new URL(imageUrl);
      } catch {
        send(response, 400, JSON.stringify({ error: "Invalid image URL." }));
        return;
      }
      if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
        send(response, 400, JSON.stringify({ error: "Only HTTP/HTTPS image URLs are allowed." }));
        return;
      }
      // Upgrade http to https before fetching
      const fetchUrl = imageUrl.replace(/^http:\/\//, "https://");

      const imgResponse = await fetch(fetchUrl, {
        headers: { "User-Agent": "ARCS Comic Tracker" },
        signal: AbortSignal.timeout(12000)
      });

      if (!imgResponse.ok) {
        send(response, 502, JSON.stringify({ error: `Image fetch failed: ${imgResponse.status}` }));
        return;
      }

      const contentType = imgResponse.headers.get("content-type") || "image/jpeg";
      if (!contentType.startsWith("image/")) {
        send(response, 400, JSON.stringify({ error: "URL did not return an image." }));
        return;
      }

      const buffer = Buffer.from(await imgResponse.arrayBuffer());

      // Save to covers directory
      const filename = getCoverFilename(imageUrl);
      const sanitizedFilename = sanitizeFilename(filename);
      const filepath = path.join(coversDir, sanitizedFilename);
      fs.writeFileSync(filepath, buffer);

      send(response, 200, JSON.stringify({ success: true, filename: sanitizedFilename }));
    } catch (error) {
      send(response, 500, JSON.stringify({ error: "Failed to fetch and save cover." }));
    }
    return;
  }

  send(response, 404, JSON.stringify({ error: "Cover endpoint not found." }));
}

async function handleProfileRequest(request, response) {
  const url = new URL(request.url, `http://localhost:${port}`);
  const path = url.pathname;

  if (path === "/api/profile/register" && request.method === "POST") {
    try {
      const clientIp = request.socket.remoteAddress || "unknown";
      if (!checkRateLimit(`register:${clientIp}`)) {
        send(response, 429, JSON.stringify({ error: "Too many registration attempts. Please try again later." }));
        return;
      }

      const payload = await readJson(request);
      const { email, password, name, publisher, avatar } = payload;

      if (!email || !password || !name) {
        send(response, 400, JSON.stringify({ error: "Email, password, and name are required." }));
        return;
      }

      // Validate email format
      if (!validateEmail(email)) {
        send(response, 400, JSON.stringify({ error: "Invalid email format." }));
        return;
      }

      // Validate input strings
      if (!validateString(name, 100) || !validateString(password, 255)) {
        send(response, 400, JSON.stringify({ error: "Invalid input format." }));
        return;
      }

      if (profiles[email]) {
        send(response, 409, JSON.stringify({ error: "Email already registered." }));
        return;
      }

      const syncName = generateSyncName();
      const passwordHash = await hashPassword(password);
      profiles[email] = {
        email,
        passwordHash,
        name,
        publisher: publisher || "Either",
        avatar: avatar || "ðŸ“š",
        syncName,
        createdAt: new Date().toISOString(),
        data: {}
      };

      saveProfiles();
      
      // Send thank you email
      await sendEmail(email, "Welcome to ARCS!", `Thank you for signing up for ARCS! Comic Reading Tracker, ${name}! Your sync name is: ${syncName}`);
      
      send(response, 201, JSON.stringify({ 
        success: true, 
        syncName,
        message: "Profile registered successfully." 
      }));
    } catch (error) {
      send(response, 500, JSON.stringify({ error: "An error occurred during registration." }));
    }
  } else if (path === "/api/profile/login" && request.method === "POST") {
    try {
      const payload = await readJson(request);
      const { email, password } = payload;

      if (!email || !password) {
        send(response, 400, JSON.stringify({ error: "Email and password are required." }));
        return;
      }

      // Validate email format
      if (!validateEmail(email)) {
        send(response, 400, JSON.stringify({ error: "Invalid email format." }));
        return;
      }

      // Rate limiting check
      const clientIp = request.socket.remoteAddress || 'unknown';
      if (!checkRateLimit(`login:${clientIp}`)) {
        send(response, 429, JSON.stringify({ error: "Too many login attempts. Please try again later." }));
        return;
      }

      const profile = profiles[email];
      if (!profile || !(await verifyPassword(password, profile.passwordHash))) {
        send(response, 401, JSON.stringify({ error: "Invalid email or password." }));
        return;
      }

      // Generate JWT token
      const token = generateToken(email);

      // Return profile data without password hash
      const { passwordHash, ...profileData } = profile;
      send(response, 200, JSON.stringify({ 
        success: true, 
        profile: profileData,
        token,
        message: "Login successful." 
      }));
    } catch (error) {
      send(response, 500, JSON.stringify({ error: "An error occurred during login." }));
    }
  } else if (path === "/api/profile/save" && request.method === "POST") {
    try {
      const decoded = requireAuth(request, response);
      if (!decoded) return;

      const payload = await readJson(request);
      const { data } = payload;

      const profile = profiles[decoded.email];
      if (!profile) {
        send(response, 404, JSON.stringify({ error: "Profile not found." }));
        return;
      }

      // Guard against unbounded payload — serialize and check size before saving
      const serialized = JSON.stringify(data);
      if (serialized.length > 512 * 1024) { // 512 KB per-profile limit
        send(response, 413, JSON.stringify({ error: "Profile data too large (max 512 KB)." }));
        return;
      }
      profile.data = data;
      profile.updatedAt = new Date().toISOString();
      saveProfiles();

      send(response, 200, JSON.stringify({
        success: true,
        message: "Profile data saved successfully."
      }));
    } catch (error) {
      send(response, 500, JSON.stringify({ error: "An error occurred while saving profile data." }));
    }
  } else if (path === "/api/profile/reset-password" && request.method === "POST") {
    try {
      const payload = await readJson(request);
      const { email } = payload;

      if (!email) {
        send(response, 400, JSON.stringify({ error: "Email is required." }));
        return;
      }

      // Validate email format
      if (!validateEmail(email)) {
        send(response, 400, JSON.stringify({ error: "Invalid email format." }));
        return;
      }

      // Rate limiting check
      const clientIp = request.socket.remoteAddress || 'unknown';
      if (!checkRateLimit(`reset:${clientIp}`)) {
        send(response, 429, JSON.stringify({ error: "Too many reset requests. Please try again later." }));
        return;
      }

      const profile = profiles[email];
      // Always return 200 regardless of whether the email exists — prevents account enumeration
      if (!profile) {
        send(response, 200, JSON.stringify({ success: true, message: "If that email is registered, a reset link has been sent." }));
        return;
      }

      // Generate reset token
      const token = generateResetToken();
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour expiry
      
      resetTokens[tokenHash] = {
        email,
        expiresAt
      };
      saveResetTokens();

      const publicBaseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${port}`;
      const resetLink = `${publicBaseUrl}/reset-password?token=${token}`;
      const emailResult = await sendEmail(email, "Password Reset Request", `Click this link to reset your password: ${resetLink}\n\nThis link will expire in 1 hour.`);

      send(response, 200, JSON.stringify({ 
        success: true,
        message: emailResult.success ? "Password reset link sent to your email." : "Password reset link generated in the server log. Configure email before production use."
      }));
    } catch (error) {
      send(response, 500, JSON.stringify({ error: "An error occurred during password reset." }));
    }
  } else {
    send(response, 404, JSON.stringify({ error: "Profile endpoint not found." }));
  }
}

async function handleWebCoverSearch(request, response) {
  try {
    const url = new URL(request.url, `http://localhost:${port}`);
    const query = String(url.searchParams.get("q") || "").trim();

    if (!query) {
      send(response, 400, JSON.stringify({ error: "Search query is required." }));
      return;
    }

    const results = [];

    try {
      const booksUrl = new URL("https://www.googleapis.com/books/v1/volumes");
      booksUrl.searchParams.set("q", query);
      booksUrl.searchParams.set("maxResults", "10");

      const booksResponse = await fetch(booksUrl, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(10000)
      });

      if (booksResponse.ok) {
        const booksData = await booksResponse.json();
        if (Array.isArray(booksData?.items)) {
          booksData.items.forEach((item) => {
            const imageLinks = item.volumeInfo?.imageLinks || {};
            const image = imageLinks.thumbnail || imageLinks.smallThumbnail || "";
            if (image) {
              results.push({
                image: image.replace(/^http:/, "https:"),
                url: item.volumeInfo?.infoLink || "",
                title: item.volumeInfo?.title || query
              });
            }
          });
        }
      }
    } catch {}

    try {
      const openLibraryUrl = new URL("https://openlibrary.org/search.json");
      openLibraryUrl.searchParams.set("q", query);
      openLibraryUrl.searchParams.set("limit", "10");

      const openLibraryResponse = await fetch(openLibraryUrl, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(10000)
      });

      if (openLibraryResponse.ok) {
        const openLibraryData = await openLibraryResponse.json();
        if (Array.isArray(openLibraryData?.docs)) {
          openLibraryData.docs.forEach((doc) => {
            if (doc.cover_i) {
              results.push({
                image: `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`,
                url: doc.key ? `https://openlibrary.org${doc.key}` : "",
                title: doc.title || query
              });
            }
          });
        }
      }
    } catch {}

    send(response, 200, JSON.stringify({ results }));
  } catch (error) {
    send(response, 200, JSON.stringify({ results: [] }));
  }
}

// Cache trending results for 1 hour to avoid re-fetching on every page visit
const trendingCache = { arcs: null, issues: null, arcsTs: 0, issuesTs: 0 };
const TRENDING_TTL = 60 * 60 * 1000;

const POPULAR_STORY_ARCS = [
  { title: "The Dark Knight Returns", series: "Batman: The Dark Knight Returns", publisher: "DC", type: "Story Arc" },
  { title: "Watchmen", series: "Watchmen", publisher: "DC", type: "Story Arc" },
  { title: "Civil War", series: "Civil War", publisher: "Marvel", type: "Story Arc" },
  { title: "Infinity Gauntlet", series: "Infinity Gauntlet", publisher: "Marvel", type: "Story Arc" },
  { title: "Knightfall", series: "Batman: Knightfall", publisher: "DC", type: "Story Arc" },
  { title: "Kingdom Come", series: "Kingdom Come", publisher: "DC", type: "Story Arc" },
  { title: "Secret Wars (2015)", series: "Secret Wars", publisher: "Marvel", type: "Story Arc" },
  { title: "House of M", series: "House of M", publisher: "Marvel", type: "Story Arc" },
  { title: "Crisis on Infinite Earths", series: "Crisis on Infinite Earths", publisher: "DC", type: "Story Arc" },
  { title: "Age of Ultron", series: "Age of Ultron", publisher: "Marvel", type: "Story Arc" },
  { title: "Annihilation", series: "Annihilation", publisher: "Marvel", type: "Story Arc" },
  { title: "Sinestro Corps War", series: "Green Lantern: Sinestro Corps War", publisher: "DC", type: "Story Arc" },
  { title: "Born Again", series: "Daredevil: Born Again", publisher: "Marvel", type: "Story Arc" },
  { title: "Kraven's Last Hunt", series: "Spider-Man: Kraven's Last Hunt", publisher: "Marvel", type: "Story Arc" },
  { title: "The Death of Superman", series: "The Death of Superman", publisher: "DC", type: "Story Arc" },
  { title: "No Man's Land", series: "Batman: No Man's Land", publisher: "DC", type: "Story Arc" },
  { title: "World War Hulk", series: "World War Hulk", publisher: "Marvel", type: "Story Arc" },
  { title: "Planet Hulk", series: "Planet Hulk", publisher: "Marvel", type: "Story Arc" },
  { title: "Old Man Logan", series: "Old Man Logan", publisher: "Marvel", type: "Story Arc" },
  { title: "Fear Itself", series: "Fear Itself", publisher: "Marvel", type: "Story Arc" },
];

const POPULAR_ISSUES = [
  { title: "Amazing Fantasy #15", series: "Amazing Fantasy", publisher: "Marvel" },
  { title: "The Amazing Spider-Man #1", series: "The Amazing Spider-Man", publisher: "Marvel" },
  { title: "Batman #1", series: "Batman", publisher: "DC" },
  { title: "X-Men #1", series: "X-Men", publisher: "Marvel" },
  { title: "Incredible Hulk #1", series: "Incredible Hulk", publisher: "Marvel" },
  { title: "The Amazing Spider-Man #121", series: "The Amazing Spider-Man", publisher: "Marvel" },
  { title: "Uncanny X-Men #141", series: "Uncanny X-Men", publisher: "Marvel" },
  { title: "The Amazing Spider-Man #300", series: "The Amazing Spider-Man", publisher: "Marvel" },
  { title: "Wolverine #1", series: "Wolverine", publisher: "Marvel" },
  { title: "Fantastic Four #1", series: "Fantastic Four", publisher: "Marvel" },
];

async function handleTrending(request, response) {
  try {
    const url = new URL(request.url, `http://localhost:${port}`);
    const type = String(url.searchParams.get("type") || "arcs");
    const apiKey = String(url.searchParams.get("apiKey") || "").trim();

    // Return cached results if fresh
    if (type === "issues" && trendingCache.issues && Date.now() - trendingCache.issuesTs < TRENDING_TTL) {
      send(response, 200, JSON.stringify({ results: trendingCache.issues, cached: true }));
      return;
    }
    if (type === "arcs" && trendingCache.arcs && Date.now() - trendingCache.arcsTs < TRENDING_TTL) {
      send(response, 200, JSON.stringify({ results: trendingCache.arcs, cached: true }));
      return;
    }

    const results = [];

    if (type === "issues") {
      // Fetch cover images in batches of 3 to avoid rate limiting
      async function fetchMarvelIssueCover(issue) {
        try {
          // Search by series name (strip issue number to avoid API 500 errors with "#")
          const searchQuery = issue.series || issue.title.replace(/\s*#\d+.*$/, "").trim();
          // Extract issue number from title (e.g. "Amazing Fantasy #15" → "15")
          const issueNumMatch = issue.title.match(/#(\d+)/);
          const issueNum = issueNumMatch ? issueNumMatch[1] : null;

          const searchRes = await fetch(`https://marvel.emreparker.com/v1/search/issues?q=${encodeURIComponent(searchQuery)}`, {
            headers: { "User-Agent": "ARCS Comic Tracker", "Accept": "application/json" },
            signal: AbortSignal.timeout(10000)
          });
          if (!searchRes.ok) return null;
          const searchData = await searchRes.json();
          const items = searchData.items || [];
          // Find exact issue number match, or fall back to first result
          const match = issueNum
            ? (items.find(it => String(it.issueNumber) === issueNum) || items[0])
            : items[0];
          if (!match?.id) return null;
          const detailRes = await fetch(`https://marvel.emreparker.com/v1/issues/${match.id}`, {
            headers: { "User-Agent": "ARCS Comic Tracker", "Accept": "application/json" },
            signal: AbortSignal.timeout(10000)
          });
          if (!detailRes.ok) return null;
          const d = await detailRes.json();
          return d.cover?.path ? `${d.cover.path}.${d.cover.extension}`.replace(/^http:/, "https:") : null;
        } catch (e) { console.error("[trending] fetchMarvelIssueCover failed:", e.message); return null; }
      }

      const issueList = POPULAR_ISSUES.slice(0, 10);
      const issueResults = [];
      const batchSize = 3;
      for (let i = 0; i < issueList.length; i += batchSize) {
        const batch = issueList.slice(i, i + batchSize);
        const covers = await Promise.all(batch.map(issue => fetchMarvelIssueCover(issue)));
        batch.forEach((issue, j) => {
          issueResults.push({ title: issue.title, source: "curated", sourceLabel: issue.publisher, cover: covers[j] || "", type: "Issue", upc: "" });
        });
        if (i + batchSize < issueList.length) await new Promise(r => setTimeout(r, 300));
      }
      results.push(...issueResults);
    } else {
      // Story arcs — try Comic Vine for cover images in parallel if key provided
      const arcResults = await Promise.all(POPULAR_STORY_ARCS.map(async (arc) => {
        let cover = "";
        let cvUrl = "";
        let description = "";
        if (apiKey) {
          try {
            const cvSearch = new URL("https://comicvine.gamespot.com/api/search/");
            cvSearch.searchParams.set("api_key", apiKey);
            cvSearch.searchParams.set("format", "json");
            cvSearch.searchParams.set("resources", "story_arc");
            cvSearch.searchParams.set("query", arc.title);
            cvSearch.searchParams.set("limit", "1");
            cvSearch.searchParams.set("field_list", "name,image,site_detail_url,deck");
            const cvRes = await fetch(cvSearch, { headers: { "User-Agent": "ARCS Comic Tracker" }, signal: AbortSignal.timeout(6000) });
            if (cvRes.ok) {
              const cvData = await cvRes.json();
              const r = (cvData.results || [])[0];
              if (r) {
                cover = (r.image?.small_url || r.image?.icon_url || "").replace(/^http:/, "https:");
                cvUrl = r.site_detail_url || "";
                description = r.deck || "";
              }
            }
          } catch {}
        }
        return { title: arc.title, source: "curated", sourceLabel: arc.publisher, cover, type: arc.type, url: cvUrl, description, priority: 1 };
      }));
      results.push(...arcResults);
    }

    // Cache and send
    if (type === "issues") { trendingCache.issues = results; trendingCache.issuesTs = Date.now(); }
    else { trendingCache.arcs = results; trendingCache.arcsTs = Date.now(); }

    send(response, 200, JSON.stringify({ results }));
  } catch (error) {
    send(response, 200, JSON.stringify({ results: [] }));
  }
}

async function handleIssueSearch(request, response) {
  try {
    const url = new URL(request.url, `http://localhost:${port}`);
    const query = String(url.searchParams.get("q") || "").trim();
    const apiKey = String(url.searchParams.get("apiKey") || "").trim();

    if (!query) {
      send(response, 400, JSON.stringify({ error: "Search query is required." }));
      return;
    }

    const results = [];

    // Comic Vine issue search — includes upc field
    if (apiKey) {
      try {
        const cvUrl = new URL("https://comicvine.gamespot.com/api/search/");
        cvUrl.searchParams.set("api_key", apiKey);
        cvUrl.searchParams.set("format", "json");
        cvUrl.searchParams.set("resources", "issue");
        cvUrl.searchParams.set("query", query);
        cvUrl.searchParams.set("limit", "10");
        cvUrl.searchParams.set("field_list", "id,name,volume,issue_number,cover_date,image,site_detail_url,upc");
        const cvRes = await fetch(cvUrl, { headers: { "User-Agent": "ARCS Comic Tracker" }, signal: AbortSignal.timeout(10000) });
        if (cvRes.ok) {
          const cvData = await cvRes.json();
          (cvData.results || []).forEach(issue => {
            const title = [issue.volume?.name, issue.issue_number ? `#${issue.issue_number}` : "", issue.name].filter(Boolean).join(" ");
            results.push({
              title,
              source: "comicvine",
              sourceLabel: "Comic Vine",
              cover: issue.image?.small_url || issue.image?.icon_url || "",
              url: issue.site_detail_url || "",
              year: (issue.cover_date || "").substring(0, 4),
              upc: issue.upc || ""
            });
          });
        }
      } catch {}
    }

    // Marvel issue search (no UPC available)
    try {
      const marvelUrl = new URL(`https://marvel.emreparker.com/v1/search/issues`);
      marvelUrl.searchParams.set("q", query);
      const marvelRes = await fetch(marvelUrl, { headers: { "User-Agent": "ARCS Comic Tracker" }, signal: AbortSignal.timeout(10000) });
      if (marvelRes.ok) {
        const marvelData = await marvelRes.json();
        (marvelData.items || []).slice(0, 10).forEach(issue => {
          results.push({
            title: issue.title || `${issue.seriesName} #${issue.issueNumber}`,
            source: "marvel",
            sourceLabel: "Marvel",
            cover: "",
            url: issue.detailUrl || "",
            year: String(issue.yearPage || ""),
            upc: ""
          });
        });
      }
    } catch {}

    // GCD issue search — barcode field is the UPC
    // Parse issue number from query if present (e.g. "Amazing Spider-Man #1" → seriesName="Amazing Spider-Man", issueNum="1")
    try {
      const issueMatch = query.match(/^(.+?)\s*#\s*(\d+)\s*$/);
      const seriesQuery = issueMatch ? issueMatch[1].trim() : query;
      const issueNum = issueMatch ? issueMatch[2] : null;

      const gcdUrl = new URL(`https://www.comics.org/api/series/name/${encodeURIComponent(seriesQuery)}/`);
      const gcdRes = await fetch(gcdUrl, { headers: { "User-Agent": "ARCS Comic Tracker" }, signal: AbortSignal.timeout(10000) });
      if (gcdRes.ok) {
        const gcdData = await gcdRes.json();
        const series = (gcdData.results || []).slice(0, 3);

        for (const s of series) {
          const seriesId = (String(s.api_url || "").match(/\/(\d+)\/?$/) || [])[1];
          if (!seriesId) continue;

          if (issueNum) {
            // Fetch the specific issue to get barcode/UPC and cover
            try {
              const issueUrls = String(s.active_issues || "").trim().split(/\s+/).filter(Boolean);
              // Fetch a few issues to find the matching number (limit to avoid rate limits)
              for (const iUrl of issueUrls.slice(0, 8)) {
                const iId = (iUrl.match(/\/(\d+)\/?$/) || [])[1];
                if (!iId) continue;
                const iRes = await fetch(`https://www.comics.org/api/issue/${iId}/`, { headers: { "User-Agent": "ARCS Comic Tracker" }, signal: AbortSignal.timeout(8000) });
                if (!iRes.ok) continue;
                const iData = await iRes.json();
                if (String(iData.number) === issueNum) {
                  results.push({
                    title: `${s.name} #${iData.number}`,
                    source: "gcd",
                    sourceLabel: "GCD",
                    cover: iData.cover || "",
                    url: `https://www.comics.org/issue/${iId}/`,
                    year: s.year_began || "",
                    upc: iData.barcode || ""
                  });
                  break;
                }
              }
            } catch {}
          } else {
            results.push({
              title: s.name,
              source: "gcd",
              sourceLabel: "GCD",
              cover: "",
              url: `https://www.comics.org/series/${seriesId}/`,
              year: s.year_began || "",
              upc: "",
              isSeriesResult: true,
              seriesId
            });
          }
        }
      }
    } catch {}

    send(response, 200, JSON.stringify({ results }));
  } catch (error) {
    send(response, 200, JSON.stringify({ results: [] }));
  }
}

async function handleUnifiedSearch(request, response) {
  try {
    const url = new URL(request.url, `http://localhost:${port}`);
    const query = String(url.searchParams.get("q") || "").trim();

    if (!query) {
      send(response, 400, JSON.stringify({ error: "Search query is required." }));
      return;
    }

    const results = [];
    const seen = new Set();

    try {
      const booksUrl = new URL("https://www.googleapis.com/books/v1/volumes");
      booksUrl.searchParams.set("q", `${query} comic graphic novel`);
      booksUrl.searchParams.set("maxResults", "20");

      const booksResponse = await fetch(booksUrl, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(10000)
      });

      if (booksResponse.ok) {
        const booksData = await booksResponse.json();
        if (Array.isArray(booksData?.items)) {
          booksData.items.forEach((item) => {
            const info = item.volumeInfo || {};
            const title = info.title || query;
            const key = title.toLowerCase();
            if (seen.has(key)) return;
            seen.add(key);

            const imageLinks = info.imageLinks || {};
            results.push({
              id: item.id || key,
              name: title,
              title,
              description: info.description || [info.publisher, Array.isArray(info.authors) ? info.authors.join(", ") : ""].filter(Boolean).join(" Â· "),
              image_url: (imageLinks.thumbnail || imageLinks.smallThumbnail || "").replace(/^http:/, "https:"),
              source: "web",
              sourceLabel: "Internet Search",
              type: "Book/Comic",
              priority: 3,
              url: info.infoLink || "",
              issues: [title]
            });
          });
        }
      }
    } catch {}

    try {
      const openLibraryUrl = new URL("https://openlibrary.org/search.json");
      openLibraryUrl.searchParams.set("q", `${query} comic`);
      openLibraryUrl.searchParams.set("limit", "20");

      const openLibraryResponse = await fetch(openLibraryUrl, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(10000)
      });

      if (openLibraryResponse.ok) {
        const openLibraryData = await openLibraryResponse.json();
        if (Array.isArray(openLibraryData?.docs)) {
          openLibraryData.docs.forEach((doc) => {
            const title = doc.title || query;
            const key = title.toLowerCase();
            if (seen.has(key)) return;
            seen.add(key);

            results.push({
              id: doc.key || key,
              name: title,
              title,
              description: [Array.isArray(doc.author_name) ? doc.author_name.join(", ") : "", doc.first_publish_year || ""].filter(Boolean).join(" Â· "),
              image_url: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : "",
              source: "web",
              sourceLabel: "Internet Search",
              type: "Book/Comic",
              priority: 3,
              url: doc.key ? `https://openlibrary.org${doc.key}` : "",
              issues: [title]
            });
          });
        }
      }
    } catch {}

    send(response, 200, JSON.stringify({ results }));
  } catch (error) {
    send(response, 200, JSON.stringify({ results: [] }));
  }
}

function serveStatic(request, response) {
  const requestUrl = new URL(request.url, `http://localhost:${port}`);
  const requestedPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const filePath = path.normalize(path.join(root, requestedPath));

  // Use root + sep to prevent "startsWith" matching a sibling directory
  // e.g. root="/app" must not match "/app-secrets/..."
  if (!filePath.startsWith(root + path.sep) && filePath !== root) {
    send(response, 403, "Forbidden", "text/plain");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      send(response, 404, "Not found", "text/plain");
      return;
    }
    send(response, 200, data, mimeTypes[path.extname(filePath)] || "application/octet-stream");
  });
}

const server = http.createServer((request, response) => {
  if (request.method === "OPTIONS") {
    send(response, 204, "");
    return;
  }

  // All proxy and cover endpoints require a valid JWT
  if (
    request.url.startsWith("/api/komga-proxy") ||
    request.url.startsWith("/api/comicvine-proxy") ||
    request.url.startsWith("/api/gcd-proxy") ||
    request.url.startsWith("/api/marvel-proxy") ||
    request.url.startsWith("/api/mylar-proxy") ||
    request.url.startsWith("/api/covers")
  ) {
    if (!requireAuth(request, response)) return;
  }

  if (request.url.startsWith("/api/komga-proxy")) {
    proxyKomga(request, response);
    return;
  }

  if (request.url.startsWith("/api/comicvine-proxy")) {
    proxyComicVine(request, response);
    return;
  }

  if (request.url.startsWith("/api/gcd-proxy")) {
    proxyGcd(request, response);
    return;
  }

  if (request.url.startsWith("/api/marvel-proxy")) {
    proxyMarvel(request, response);
    return;
  }

  if (request.url.startsWith("/api/mylar-proxy")) {
    proxyMylar(request, response);
    return;
  }

  if (request.url.startsWith("/api/covers")) {
    handleCoverRequest(request, response);
    return;
  }

  if (request.url.startsWith("/api/profile")) {
    handleProfileRequest(request, response);
    return;
  }

  if (request.url.startsWith("/api/web-cover-search")) {
    handleWebCoverSearch(request, response);
    return;
  }

  if (request.url.startsWith("/api/unified-search")) {
    handleUnifiedSearch(request, response);
    return;
  }

  if (request.url.startsWith("/api/issue-search")) {
    handleIssueSearch(request, response);
    return;
  }

  if (request.url.startsWith("/api/trending")) {
    handleTrending(request, response);
    return;
  }

  serveStatic(request, response);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Close the other ARCS! server window or set a different PORT.`);
    return;
  }
  console.error(`ARCS! server failed: ${error.message}`);
});

// Bind to 0.0.0.0 so cloud hosts (Railway, Render, etc.) can route traffic in.
// Locally this still works fine — just access http://localhost:4177 as before.
server.listen(port, "0.0.0.0", () => {
  console.log(`ARCS! running at http://0.0.0.0:${port}`);
});

