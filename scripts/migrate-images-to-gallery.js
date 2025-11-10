#!/usr/bin/env node

/**
 * Script para migrar todas las imágenes de subdirectorios (blog/, authors/, categories/)
 * al directorio unificado gallery/
 */

const fs = require("fs");
const path = require("path");

const UPLOADS_DIR = path.join(__dirname, "../public/uploads");
const GALLERY_DIR = path.join(UPLOADS_DIR, "gallery");

// Crear directorio gallery si no existe
if (!fs.existsSync(GALLERY_DIR)) {
  fs.mkdirSync(GALLERY_DIR, { recursive: true });
  console.log("✓ Created gallery directory");
}

// Buscar todas las imágenes en subdirectorios
const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

function findImages(dir, relativePath = "") {
  const images = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip gallery directory
        if (entry.name === "gallery") continue;
        
        // Recurse into subdirectories
        images.push(...findImages(fullPath, relPath));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (imageExtensions.includes(ext)) {
          images.push({ fullPath, relPath, name: entry.name });
        }
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
  }
  
  return images;
}

// Find all images
console.log("Searching for images...");
const images = findImages(UPLOADS_DIR);

if (images.length === 0) {
  console.log("No images found to migrate.");
  process.exit(0);
}

console.log(`Found ${images.length} image(s) to migrate:\n`);

// Move images to gallery
let moved = 0;
let skipped = 0;

for (const img of images) {
  // Generate unique filename to avoid conflicts
  const basename = path.basename(img.name, path.extname(img.name));
  const ext = path.extname(img.name);
  let newName = img.name;
  let counter = 1;
  let destPath = path.join(GALLERY_DIR, newName);
  
  // Handle filename conflicts
  while (fs.existsSync(destPath)) {
    newName = `${basename}-${counter}${ext}`;
    destPath = path.join(GALLERY_DIR, newName);
    counter++;
  }
  
  try {
    // Move file
    fs.renameSync(img.fullPath, destPath);
    console.log(`  ✓ ${img.relPath} → gallery/${newName}`);
    moved++;
  } catch (err) {
    console.error(`  ✗ Failed to move ${img.relPath}:`, err.message);
    skipped++;
  }
}

console.log(`\n✓ Migration complete: ${moved} moved, ${skipped} skipped`);

// Clean up empty directories
function cleanupEmptyDirs(dir) {
  if (dir === GALLERY_DIR) return;
  
  try {
    const entries = fs.readdirSync(dir);
    
    // Recursively clean subdirectories first
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      if (fs.statSync(fullPath).isDirectory()) {
        cleanupEmptyDirs(fullPath);
      }
    }
    
    // Check if directory is now empty
    const remaining = fs.readdirSync(dir);
    if (remaining.length === 0 && dir !== UPLOADS_DIR) {
      fs.rmdirSync(dir);
      console.log(`  Removed empty directory: ${path.relative(UPLOADS_DIR, dir)}`);
    }
  } catch (err) {
    // Ignore errors
  }
}

console.log("\nCleaning up empty directories...");
cleanupEmptyDirs(UPLOADS_DIR);

console.log("\n✓ All done!");
