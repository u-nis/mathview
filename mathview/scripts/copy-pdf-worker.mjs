// Copies pdf.js's web worker into /public so the PDF preview can load it as a
// plain static file (works the same under Turbopack and webpack).
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(root, "package.json"));

try {
  const src = require.resolve("pdfjs-dist/build/pdf.worker.min.mjs");
  const destDir = join(root, "public");
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
  copyFileSync(src, join(destDir, "pdf.worker.min.mjs"));
  console.log("[mathview] copied pdf.worker.min.mjs to public/");
} catch (err) {
  console.warn("[mathview] could not copy pdf.js worker:", err.message);
}
