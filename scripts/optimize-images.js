#!/usr/bin/env node

/**
 * Image Optimization Script for High-Traffic Sites (50k+ active users)
 *
 * This script optimizes all images in the public directory for web performance:
 * - Resizing oversized images
 * - Converting to modern formats (WebP, AVIF)
 * - Optimizing compression
 * - Creating responsive image sets
 * - Generating placeholder thumbnails
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Ensure Sharp is installed
try {
  require.resolve("sharp");
} catch (e) {
  console.log("Installing required dependencies...");
  execSync("npm install --save-dev sharp");
}

const sharp = require("sharp");

// Configuration
const config = {
  // Source image directories
  sourceDir: path.join(__dirname, "../public"),

  // Max dimensions for web-optimized images
  maxWidth: 2000,
  maxHeight: 2000,

  // Quality settings
  jpegQuality: 80,
  webpQuality: 75,
  avifQuality: 60,

  // Responsive image breakpoints
  breakpoints: [320, 640, 960, 1280, 1920],

  // File size thresholds for optimization (in KB)
  sizeThreshold: 100,

  // Extensions to process
  extensions: [".jpg", ".jpeg", ".png", ".gif"],

  // Placeholder generation
  generatePlaceholders: true,
  placeholderWidth: 20,

  // Skip already processed images
  skipProcessed: true,
};

// Counters for reporting
const stats = {
  processed: 0,
  skipped: 0,
  errors: 0,
  savedBytes: 0,
};

// Create output directories if they don't exist
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Process a single image file
async function processImage(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    if (!config.extensions.includes(ext)) return;

    const fileStats = fs.statSync(filePath);
    const fileSizeKB = fileStats.size / 1024;

    // Skip small files that don't need optimization
    if (fileSizeKB < 20) {
      console.log(
        `Skipping small file (${fileSizeKB.toFixed(2)}KB): ${filePath}`
      );
      stats.skipped++;
      return;
    }

    // Skip already processed files if enabled
    const relativePath = path.relative(config.sourceDir, filePath);
    const webpPath = path.join(
      config.sourceDir,
      "optimized",
      relativePath.replace(ext, ".webp")
    );
    if (config.skipProcessed && fs.existsSync(webpPath)) {
      console.log(`Skipping already processed: ${relativePath}`);
      stats.skipped++;
      return;
    }

    console.log(`Processing: ${relativePath} (${fileSizeKB.toFixed(2)}KB)`);

    // Read the image
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Skip if image is already small enough
    if (
      metadata.width <= config.maxWidth &&
      metadata.height <= config.maxHeight &&
      fileSizeKB < config.sizeThreshold
    ) {
      console.log(`Skipping already optimized: ${relativePath}`);
      stats.skipped++;
      return;
    }

    // Resize if needed
    if (
      metadata.width > config.maxWidth ||
      metadata.height > config.maxHeight
    ) {
      image.resize({
        width: Math.min(metadata.width, config.maxWidth),
        height: Math.min(metadata.height, config.maxHeight),
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Create output directory
    const outputDir = path.join(
      config.sourceDir,
      "optimized",
      path.dirname(relativePath)
    );
    ensureDir(outputDir);

    // Output base filename
    const baseName = path.basename(filePath, ext);

    // Save optimized WebP version
    const webpOutputPath = path.join(outputDir, `${baseName}.webp`);
    await image.webp({ quality: config.webpQuality }).toFile(webpOutputPath);

    // Save optimized AVIF version for modern browsers
    const avifOutputPath = path.join(outputDir, `${baseName}.avif`);
    await image.avif({ quality: config.avifQuality }).toFile(avifOutputPath);

    // Save optimized original format version
    const originalOutputPath = path.join(outputDir, `${baseName}${ext}`);
    if (ext === ".jpg" || ext === ".jpeg") {
      await image
        .jpeg({ quality: config.jpegQuality, mozjpeg: true })
        .toFile(originalOutputPath);
    } else if (ext === ".png") {
      await image
        .png({ compressionLevel: 9, palette: true })
        .toFile(originalOutputPath);
    } else {
      await image.toFile(originalOutputPath);
    }

    // Generate responsive versions for WebP
    if (metadata.width > config.breakpoints[0]) {
      for (const width of config.breakpoints) {
        if (width < metadata.width) {
          const resizedOutput = path.join(
            outputDir,
            `${baseName}-${width}.webp`
          );
          await image
            .resize({ width, height: null, withoutEnlargement: true })
            .webp({ quality: config.webpQuality })
            .toFile(resizedOutput);
        }
      }
    }

    // Generate placeholder for lazy loading
    if (config.generatePlaceholders) {
      const placeholderPath = path.join(
        outputDir,
        `${baseName}-placeholder.webp`
      );
      await image
        .resize({ width: config.placeholderWidth, height: null, fit: "inside" })
        .blur(5)
        .webp({ quality: 30 })
        .toFile(placeholderPath);
    }

    // Calculate space savings
    const newSizeKB = fs.statSync(webpOutputPath).size / 1024;
    const savedKB = fileSizeKB - newSizeKB;
    stats.savedBytes += savedKB * 1024;

    console.log(
      `✅ Saved ${savedKB.toFixed(2)}KB (${Math.round(
        (savedKB / fileSizeKB) * 100
      )}%)`
    );
    stats.processed++;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    stats.errors++;
  }
}

// Walk directories recursively to find images
function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    // Skip the optimized directory to avoid processing already optimized images
    if (entry.name === "optimized") continue;

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile()) {
      processImage(fullPath);
    }
  }
}

// Create manifest file for optimized images
function createManifest() {
  const manifest = {
    version: 1,
    generated: new Date().toISOString(),
    images: {},
  };

  function scanOptimizedDir(dirPath, basePath = "") {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.join(basePath, entry.name);

      if (entry.isDirectory()) {
        scanOptimizedDir(fullPath, relativePath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        const baseNameMatch = entry.name.match(/(.+?)(?:-\d+)?\.[^.]+$/);

        if (baseNameMatch) {
          const baseName = baseNameMatch[1];
          const key = path.join(basePath, baseName).replace(/\\/g, "/");

          if (!manifest.images[key]) {
            manifest.images[key] = {
              formats: {},
              responsive: [],
            };
          }

          // Check if it's a responsive variant
          const sizeMatch = entry.name.match(/-(\d+)\.[^.]+$/);
          if (sizeMatch) {
            const width = parseInt(sizeMatch[1]);
            const format = ext.substring(1); // Remove the dot
            manifest.images[key].responsive.push({
              width,
              format,
              path: relativePath.replace(/\\/g, "/"),
            });
          } else if (entry.name.includes("-placeholder")) {
            manifest.images[key].placeholder = relativePath.replace(/\\/g, "/");
          } else {
            const format = ext.substring(1); // Remove the dot
            manifest.images[key].formats[format] = relativePath.replace(
              /\\/g,
              "/"
            );
          }
        }
      }
    }
  }

  const optimizedDir = path.join(config.sourceDir, "optimized");
  if (fs.existsSync(optimizedDir)) {
    scanOptimizedDir(optimizedDir);

    // Write manifest file
    const manifestPath = path.join(optimizedDir, "manifest.json");
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`✅ Created image manifest at ${manifestPath}`);
  }
}

// Main execution
async function main() {
  console.log("Starting image optimization for high-traffic site...");
  console.log(`Source directory: ${config.sourceDir}`);

  const startTime = process.hrtime();

  // Create optimized directory
  ensureDir(path.join(config.sourceDir, "optimized"));

  // Process all images
  processDirectory(config.sourceDir);

  // Create manifest
  createManifest();

  const [seconds, nanoseconds] = process.hrtime(startTime);
  const totalTime = seconds + nanoseconds / 1e9;

  // Print summary
  console.log("\n=== Optimization Summary ===");
  console.log(`Processed: ${stats.processed} images`);
  console.log(`Skipped: ${stats.skipped} images`);
  console.log(`Errors: ${stats.errors} images`);
  console.log(`Saved: ${(stats.savedBytes / (1024 * 1024)).toFixed(2)}MB`);
  console.log(`Time taken: ${totalTime.toFixed(2)} seconds`);
  console.log("============================");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
