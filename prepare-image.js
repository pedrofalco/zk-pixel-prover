import sharp from 'sharp';
import { join } from 'path';
import * as fs from 'fs';

async function imageToPixels(imagePath) {
    try {
        // Check if file exists and has valid extension
        const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const ext = imagePath.toLowerCase().slice(imagePath.lastIndexOf('.'));
        
        if (!validExtensions.includes(ext)) {
            throw new Error(`Unsupported image format: ${ext}. Please use: ${validExtensions.join(', ')}`);
        }

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
        
        console.log('\nProcessed image:');
        console.log('- Resized to: 4x4');
        console.log('- Kept RGB color (3 channels per pixel)');
        console.log('- Total values:', pixels.length, '(16 pixels × 3 channels = 48 values)');
        console.log('- First few pixel values (RGB):', pixels.slice(0, 12));
        
        // Verify we got exactly 48 values (16 pixels × 3 channels)
        if (pixels.length !== 48) {
            throw new Error(`Expected 48 values (16 pixels × 3 RGB channels), got ${pixels.length}`);
        }

        // Save to input.json
        const input = {
            pixels: pixels,
            hash: 0  // Initial hash value, will be updated after first circuit run
        };
        
        fs.writeFileSync('static/input.json', JSON.stringify(input, null, 2));
        console.log('\nSaved pixel values to input.json');
        
        return pixels;
        
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
}

// Example usage:
imageToPixels('static/manoloide_4x4.jpeg');
