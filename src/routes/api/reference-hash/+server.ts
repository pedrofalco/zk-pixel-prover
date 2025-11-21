import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { join } from 'path';
import sharp from 'sharp';
import { buildPoseidon } from 'circomlibjs';

export async function GET() {
    try {
        // Load the reference image
        const referenceImagePath = join(process.cwd(), 'static', 'sample_4x4.jpeg');
        
        // Process image: resize to 4x4, remove alpha, get RGB pixels
        const processedBuffer = await sharp(referenceImagePath)
            .resize(4, 4, { fit: 'fill' })
            .removeAlpha()
            .raw()
            .toBuffer();

        // Convert to array of RGB values (48 values: 16 pixels × 3 channels)
        const pixels = Array.from(processedBuffer);

        if (pixels.length !== 48) {
            throw new Error(`Expected 48 values (16 pixels × 3 RGB channels), got ${pixels.length}`);
        }

        // Calculate hash using Poseidon
        const poseidon = await buildPoseidon();
        
        const hash1 = poseidon(pixels.slice(0, 12));
        const hash2 = poseidon(pixels.slice(12, 24));
        const hash3 = poseidon(pixels.slice(24, 36));
        const hash4 = poseidon(pixels.slice(36, 48));
        const finalHash = poseidon([hash1, hash2, hash3, hash4]);
        const hashString = poseidon.F.toString(finalHash);

        return json({
            success: true,
            data: {
                hash: hashString,
                pixels
            }
        });
    } catch (err) {
        console.error('Reference hash calculation error:', err);
        throw error(500, err instanceof Error ? err.message : String(err));
    }
}

