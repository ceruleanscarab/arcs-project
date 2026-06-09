const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "mobile-www");

const files = [
  "index.html",
  "app.js",
  "styles.css",
  "arcs-logo.jpg",
  "Doom-6.png",
  "HawkEye-5.png",
  "Hulk-5.png",
  "IronMan-5.png",
  "Rocket-5.png",
  "Spiderman-5.png",
  "Thing-5.png"
];

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const file of files) {
  const source = path.join(root, file);
  const target = path.join(outDir, file);

  if (fs.existsSync(source)) {
    fs.copyFileSync(source, target);
  }
}

console.log(`Prepared Android web assets in ${outDir}`);
