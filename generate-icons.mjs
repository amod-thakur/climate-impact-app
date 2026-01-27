// Generate PNG icons from SVG files using sharp
import sharp from 'sharp';
import { readFileSync } from 'fs';

async function generateIcons() {
  try {
    // Read SVG files
    const svg192 = readFileSync('./public/icon-192.svg');
    const svg512 = readFileSync('./public/icon-512.svg');

    // Generate 192x192 PNG
    await sharp(svg192)
      .resize(192, 192)
      .png()
      .toFile('./public/icon-192.png');
    console.log('✓ Created icon-192.png');

    // Generate 512x512 PNG
    await sharp(svg512)
      .resize(512, 512)
      .png()
      .toFile('./public/icon-512.png');
    console.log('✓ Created icon-512.png');

    console.log('\n✓ All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
