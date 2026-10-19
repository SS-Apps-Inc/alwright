const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const publicDir = path.join(root, "public");

const staticRoutes = ["feed", "privacy", "terms", "childsafety"];

function copyFile(source, target) {
  if (!fs.existsSync(source)) {
    throw new Error(`Missing source file: ${source}`);
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

for (const route of staticRoutes) {
  copyFile(path.join(dist, `${route}.html`), path.join(dist, route, "index.html"));
}

copyFile(path.join(publicDir, ".htaccess"), path.join(dist, ".htaccess"));
copyFile(path.join(publicDir, "robots.txt"), path.join(dist, "robots.txt"));
copyFile(path.join(publicDir, "sitemap.xml"), path.join(dist, "sitemap.xml"));

const notFound = path.join(dist, "+not-found.html");
if (fs.existsSync(notFound)) {
  copyFile(notFound, path.join(dist, "404.html"));
}

console.log(
  "Prepared Hostinger web dist with clean route folders, hosting rules, and search metadata."
);
