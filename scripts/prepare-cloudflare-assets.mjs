import { access, rm, writeFile, readdir } from "node:fs/promises";
import path from "node:path";

const assetsRoot = path.resolve(".open-next/assets");

try {
  await access(assetsRoot);
} catch {
  throw new Error(
    "Missing .open-next/assets. Run the OpenNext Cloudflare build first.",
  );
}
const blockedExact = new Set([
  "vercel.svg",
  "window.svg",
  "globe.svg",
  "next.svg",
  "file.svg",
]);

const ignoreFile = `# Internal files kept in the Git tree but not uploaded as public assets.
**/README.md
**/*.md
vercel.svg
window.svg
globe.svg
next.svg
file.svg
`;

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolutePath)));
      continue;
    }
    files.push(absolutePath);
  }

  return files;
}

const files = await collectFiles(assetsRoot);
let removed = 0;

for (const filePath of files) {
  const relativePath = path.relative(assetsRoot, filePath).replaceAll("\\", "/");
  const fileName = path.basename(filePath);
  if (
    fileName.toLowerCase() === "readme.md" ||
    fileName.toLowerCase().endsWith(".md") ||
    blockedExact.has(fileName)
  ) {
    await rm(filePath, { force: true });
    removed += 1;
    console.log(`excluded ${relativePath}`);
  }
}

await writeFile(path.join(assetsRoot, ".assetsignore"), ignoreFile, "utf8");
console.log(`Removed ${removed} internal files from Cloudflare assets.`);
