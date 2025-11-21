import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import sharp from 'sharp';

export async function POST({ request }) {
    try {
        const formData = await request.formData();
        const file = formData.get('image') as File;
        
        if (!file) {
            throw new Error('No image file provided');
        }

        // Check file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            throw new Error(`Unsupported image format: ${file.type}. Please use: ${validTypes.join(', ')}`);
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Process image: resize to 4x4, remove alpha, get RGB pixels
        const processedBuffer = await sharp(buffer)
            .resize(4, 4, { fit: 'fill' })
            .removeAlpha()
            .raw()
            .toBuffer();

        // Convert to array of RGB values (48 values: 16 pixels × 3 channels)
        const pixels = Array.from(processedBuffer);

        if (pixels.length !== 48) {
            throw new Error(`Expected 48 values (16 pixels × 3 RGB channels), got ${pixels.length}`);
        }

        return json({
            success: true,
            data: {
                pixels
            }
        });
    } catch (err) {
        console.error('Image processing error:', err);
        throw error(500, err instanceof Error ? err.message : String(err));
    }
}

