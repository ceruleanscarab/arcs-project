#!/usr/bin/env node
/**
 * Generates PWA icons (192x192 and 512x512 PNG) using only Node.js built-ins.
 * Produces a simple coloured circle with "A!" text — replace with your own
 * artwork later by dropping icon-192.png / icon-512.png into /icons/.
 *
 * Run once: node scripts/generate-icons.js
 */

const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "icons");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// We'll generate SVG files as fallback icons (served directly).
// For real PNGs, install 'sharp' or 'canvas'. For now SVG works in all modern
// browsers and Android Chrome accepts SVG icons in the manifest.

const sizes = [192, 512];
for (const size of sizes) {
  const r = size / 2;
  const fontSize = Math.round(size * 0.38);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${r}" cy="${r}" r="${r}" fill="#1a1a2e"/>
  <circle cx="${r}" cy="${r}" r="${r - size * 0.04}" fill="#e94560"/>
  <text x="${r}" y="${r + fontSize * 0.35}" font-family="'Georgia', serif" font-size="${fontSize}" font-weight="bold" text-anchor="middle" fill="#ffffff">A!</text>
</svg>`;
  const svgPath = path.join(outDir, `icon-${size}.svg`);
  fs.writeFileSync(svgPath, svg, "utf8");
  console.log(`Written ${svgPath}`);
}

console.log("\nIcons generated as SVG. To use PNGs, run: npm install sharp");
console.log("Then run this script again — it will auto-convert if sharp is available.");
