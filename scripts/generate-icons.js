// Run with: node scripts/generate-icons.js
// Requires: npm install sharp

/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// SVG icon with gradient background and moon
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#5b2cfc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#grad)" />
  <circle cx="256" cy="200" r="80" fill="#fef08a" opacity="0.9"/>
  <circle cx="300" cy="180" r="70" fill="url(#grad)"/>
  <path d="M150 350 Q200 280 256 320 Q312 360 362 300" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/>
  <circle cx="180" cy="380" r="20" fill="#fff" opacity="0.3"/>
  <circle cx="340" cy="400" r="15" fill="#fff" opacity="0.2"/>
  <circle cx="400" cy="150" r="10" fill="#fff" opacity="0.4"/>
  <circle cx="120" cy="180" r="8" fill="#fff" opacity="0.3"/>
</svg>
`;

async function generateIcons() {
  console.log('Generating PWA icons...');
  
  const svgBuffer = Buffer.from(svgIcon);
  
  // Generate icon-192.png
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('✓ icon-192.png');
  
  // Generate icon-512.png
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('✓ icon-512.png');
  
  // Generate apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png');
  
  // Generate favicon.ico (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✓ favicon.ico');
  
  console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
