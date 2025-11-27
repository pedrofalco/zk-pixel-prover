import sharp from 'sharp';
import { buildPoseidon } from 'circomlibjs';
import * as fs from 'fs';
import { join } from 'path';

async function prepareProverToml(imagePath) {
    try {
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

        // Calculate hash using Poseidon (matching the circuit structure)
        console.log('\n🔐 Calculating hash with Poseidon...');
        const poseidon = await buildPoseidon();
        
        const hash1 = poseidon(pixels.slice(0, 12));
        const hash2 = poseidon(pixels.slice(12, 24));
        const hash3 = poseidon(pixels.slice(24, 36));
        const hash4 = poseidon(pixels.slice(36, 48));
        const finalHash = poseidon([hash1, hash2, hash3, hash4]);
        const hashString = poseidon.F.toString(finalHash);
        
        console.log('Calculated hash:', hashString);

        // Generate Prover.toml content
        const proverToml = `expected_hash = "${hashString}"
pixels = [${pixels.join(', ')}]`;

        // Write to plonk/Prover.toml
        const proverTomlPath = join(process.cwd(), 'plonk', 'Prover.toml');
        fs.writeFileSync(proverTomlPath, proverToml);
        
        console.log('\n✅ Generated Prover.toml at:', proverTomlPath);
        console.log('\n📝 Prover.toml content:');
        console.log(proverToml);
        console.log('\n✨ You can now run:');
        console.log('   cd plonk');
        console.log('   nargo execute');
        
    } catch (error) {
        console.error('❌ Error processing image:', error);
        process.exit(1);
    }
}

// Get image path from command line argument or use default
const imagePath = process.argv[2] || 'static/sample_4x4.jpeg';

prepareProverToml(imagePath).catch(console.error);

