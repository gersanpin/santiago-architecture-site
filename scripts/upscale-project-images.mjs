import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceRoot = path.resolve("public/projects");
const outputRoot = path.resolve("public/projects-hd");
const supportedExtensions = new Set([".png", ".jpg", ".jpeg"]);
const scale = 2;
const concurrency = 4;

async function collectImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectImages(absolutePath)));
      continue;
    }

    if (supportedExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(absolutePath);
    }
  }

  return files;
}

async function upscaleImage(sourcePath) {
  const relativePath = path.relative(sourceRoot, sourcePath);
  const parsedPath = path.parse(relativePath);
  const outputPath = path.join(outputRoot, parsedPath.dir, `${parsedPath.name}.webp`);
  const image = sharp(sourcePath);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read dimensions for ${relativePath}`);
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await image
    .resize(metadata.width * scale, metadata.height * scale, {
      kernel: sharp.kernel.lanczos3,
    })
    .sharpen({ sigma: 0.8, m1: 0.8, m2: 0.4 })
    .webp({
      quality: 95,
      alphaQuality: 100,
      smartSubsample: true,
      effort: 4,
    })
    .toFile(outputPath);

  return relativePath;
}

const images = await collectImages(sourceRoot);
let nextIndex = 0;

async function worker() {
  while (nextIndex < images.length) {
    const imageIndex = nextIndex;
    nextIndex += 1;
    const relativePath = await upscaleImage(images[imageIndex]);
    console.log(`[${imageIndex + 1}/${images.length}] ${relativePath}`);
  }
}

await Promise.all(
  Array.from({ length: Math.min(concurrency, images.length) }, () => worker()),
);

console.log(`Created ${images.length} upscaled images in public/projects-hd.`);
