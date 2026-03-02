#!/usr/bin/env node
// Generate macOS .icns from build/icon.svg using sharp + iconutil
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SVG_PATH = path.join(ROOT, 'build', 'icon.svg');
const ICONSET_DIR = path.join(ROOT, 'build', 'icon.iconset');
const ICNS_PATH = path.join(ROOT, 'build', 'icon.icns');

// macOS .iconset requires these exact filenames and sizes
const SIZES = [
  { name: 'icon_16x16.png', size: 16 },
  { name: 'icon_16x16@2x.png', size: 32 },
  { name: 'icon_32x32.png', size: 32 },
  { name: 'icon_32x32@2x.png', size: 64 },
  { name: 'icon_128x128.png', size: 128 },
  { name: 'icon_128x128@2x.png', size: 256 },
  { name: 'icon_256x256.png', size: 256 },
  { name: 'icon_256x256@2x.png', size: 512 },
  { name: 'icon_512x512.png', size: 512 },
  { name: 'icon_512x512@2x.png', size: 1024 },
];

async function main() {
  // Clean and create iconset directory
  if (fs.existsSync(ICONSET_DIR)) {
    fs.rmSync(ICONSET_DIR, { recursive: true });
  }
  fs.mkdirSync(ICONSET_DIR, { recursive: true });

  const svgBuffer = fs.readFileSync(SVG_PATH);

  // Generate each size
  for (const { name, size } of SIZES) {
    await sharp(svgBuffer, { density: Math.round(72 * size / 1024 * 10) })
      .resize(size, size)
      .png()
      .toFile(path.join(ICONSET_DIR, name));
    console.log(`  ${name} (${size}x${size})`);
  }

  // Also generate a 1024px icon.png for electron-builder (used for Linux/Windows)
  await sharp(svgBuffer, { density: 720 })
    .resize(1024, 1024)
    .png()
    .toFile(path.join(ROOT, 'build', 'icon.png'));
  console.log('  icon.png (1024x1024)');

  // Run iconutil to create .icns
  execSync(`iconutil -c icns "${ICONSET_DIR}" -o "${ICNS_PATH}"`);
  console.log(`\nCreated ${ICNS_PATH}`);

  // Clean up iconset directory
  fs.rmSync(ICONSET_DIR, { recursive: true });
  console.log('Cleaned up iconset directory');
}

main().catch(err => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
