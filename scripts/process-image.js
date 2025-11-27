import sharp from 'sharp';
import * as fs from 'fs';
import { join } from 'path';

/**
 * Common image processing script for both Groth16 and PLONK
 * Processes an image: resizes to 4x4, extracts RGB pixels (48 values)
 * 
 * Usage:
 *   node scripts/process-image.js [image-path] [system]
 * 
 * Examples:
 *   node scripts/process-image.js static/sample_4x4.jpeg groth16
 *   node scripts/process-image.js static/sample_4x4.jpeg plonk
 */
async function processImage(imagePath, system = 'groth16') {
    // Check if file exists and has valid extension
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = imagePath.toLowerCase().slice(imagePath.lastIndexOf('.'));
    
    if (!validExtensions.includes(ext)) {
        throw new Error(`Unsupported image format: ${ext}. Please use: ${validExtensions.join(', ')}`);
    }

    console.log('📸 Processing image:', imagePath);

    // Read the image
    const image = sharp(imagePath);
    
    // Get image metadata
    const metadata = await image.metadata();
    console.log('Input image format:', metadata.format);
    console.log('Input image size:', metadata.width, 'x', metadata.height);
    
    // Resize to 4x4 (keep RGB color, remove alpha if present)
    const buffer = await image
        .resize(4, 4, { fit: 'fill' })
        .removeAlpha() // Remove alpha channel if present
        .raw()
        .toBuffer();

    // Convert buffer to flat array of RGB values
    // Format: [R1, G1, B1, R2, G2, B2, ..., R16, G16, B16]
    // Total: 16 pixels × 3 channels = 48 values
    const pixels = Array.from(buffer);
    
    console.log('\n✅ Processed image:');
    console.log('- Resized to: 4x4');
    console.log('- Kept RGB color (3 channels per pixel)');
    console.log('- Total values:', pixels.length, '(16 pixels × 3 channels = 48 values)');
    console.log('- First few pixel values (RGB):', pixels.slice(0, 12));
    
    // Verify we got exactly 48 values (16 pixels × 3 channels)
    if (pixels.length !== 48) {
        throw new Error(`Expected 48 values (16 pixels × 3 RGB channels), got ${pixels.length}`);
    }
    
    // Save based on system
    let outputPath = null;
    let output = null;
    let nextStep = '';
    
    if (system === 'groth16') {
        outputPath = join(process.cwd(), 'static', 'input.json');
        output = { pixels, hash: 0 };
        nextStep = '💡 Next step: Run groth16-calculate-hash.js to calculate hash';
    } else if (system === 'plonk') {
        outputPath = join(process.cwd(), 'plonk', 'pixels.json');
        output = { pixels };
        nextStep = '💡 Next step: Run plonk-calculate-hash.js to calculate hash and generate Prover.toml';
    } else {
        throw new Error(`Invalid system: ${system}. Use 'groth16' or 'plonk'`);
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\n✅ Saved pixel values to ${outputPath}`);
    if (nextStep) {
        console.log(nextStep);
    }
    
    return pixels;
}

// Get arguments from command line
const imagePath = process.argv[2] || 'static/sample_4x4.jpeg';
const system = process.argv[3] || 'groth16';

processImage(imagePath, system).catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
});

