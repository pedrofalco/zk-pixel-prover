/**
 * Client-side image processing utilities
 * Processes images entirely in the browser without sending data to the server
 */

import { buildPoseidon } from 'circomlibjs';

/**
 * Process an image file to extract RGB pixels and calculate hash
 * All processing happens in the browser - no server communication
 * 
 * @param file - Image file (JPEG, PNG, WebP, GIF)
 * @returns Object with pixels array (192 RGB values) and hash string
 */
export async function processImageFileClient(file: File): Promise<{ pixels: number[]; hash: string }> {
    // Step 1: Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
        throw new Error(`Unsupported image format: ${file.type}. Please use: ${validTypes.join(', ')}`);
    }

    // Step 2: Process image using Canvas API
    const pixels = await extractPixelsFromImage(file);

    // Step 3: Calculate hash using Poseidon (same as server-side)
    const hash = await calculatePoseidonHash(pixels);

    return { pixels, hash };
}

/**
 * Extract RGB pixels from an image file using Canvas API
 * Resizes image to 8x8 and extracts RGB values (ignoring alpha channel)
 * 
 * @param file - Image file
 * @returns Array of 192 RGB values (64 pixels × 3 channels)
 */
async function extractPixelsFromImage(file: File): Promise<number[]> {
    return new Promise((resolve, reject) => {
        // Create image element
        const img = new Image();
        
        // Create object URL from file
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            try {
                // Create canvas element
                const canvas = document.createElement('canvas');
                canvas.width = 8;
                canvas.height = 8;
                
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    URL.revokeObjectURL(objectUrl);
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                // Draw image resized to 8x8 (fill mode - stretches to fit exactly)
                ctx.drawImage(img, 0, 0, 8, 8);

                // Get image data (RGBA format)
                const imageData = ctx.getImageData(0, 0, 8, 8);
                const data = imageData.data; // Uint8ClampedArray: [R, G, B, A, R, G, B, A, ...]

                // Extract RGB values (skip alpha channel)
                const pixels: number[] = [];
                for (let i = 0; i < data.length; i += 4) {
                    pixels.push(data[i]);     // R
                    pixels.push(data[i + 1]); // G
                    pixels.push(data[i + 2]); // B
                    // Skip data[i + 3] (alpha channel)
                }

                // Clean up object URL
                URL.revokeObjectURL(objectUrl);

                // Verify we got exactly 192 values (64 pixels × 3 channels)
                if (pixels.length !== 192) {
                    reject(new Error(`Expected 192 RGB values, got ${pixels.length}`));
                    return;
                }

                resolve(pixels);
            } catch (err) {
                URL.revokeObjectURL(objectUrl);
                reject(err instanceof Error ? err : new Error(String(err)));
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to load image'));
        };

        // Load image from object URL
        img.src = objectUrl;
    });
}

/**
 * Calculate Poseidon hash from RGB pixels
 * Uses the same algorithm as the server-side implementation
 * Matches both Groth16 and PLONK circuit structures
 * 
 * @param pixels - Array of 192 RGB values (8x8 = 64 pixels × 3 channels)
 * @returns Hash string
 */
async function calculatePoseidonHash(pixels: number[]): Promise<string> {
    if (!pixels || !Array.isArray(pixels) || pixels.length !== 192) {
        throw new Error('Invalid pixels array. Expected 192 RGB values.');
    }

    // Build Poseidon instance (same as server-side)
    const poseidon = await buildPoseidon();

    // Calculate hash using Poseidon (matching circuit structure: groups of 12)
    // 192 values / 12 = 16 groups
    const hash1 = poseidon(pixels.slice(0, 12));
    const hash2 = poseidon(pixels.slice(12, 24));
    const hash3 = poseidon(pixels.slice(24, 36));
    const hash4 = poseidon(pixels.slice(36, 48));
    const hash5 = poseidon(pixels.slice(48, 60));
    const hash6 = poseidon(pixels.slice(60, 72));
    const hash7 = poseidon(pixels.slice(72, 84));
    const hash8 = poseidon(pixels.slice(84, 96));
    const hash9 = poseidon(pixels.slice(96, 108));
    const hash10 = poseidon(pixels.slice(108, 120));
    const hash11 = poseidon(pixels.slice(120, 132));
    const hash12 = poseidon(pixels.slice(132, 144));
    const hash13 = poseidon(pixels.slice(144, 156));
    const hash14 = poseidon(pixels.slice(156, 168));
    const hash15 = poseidon(pixels.slice(168, 180));
    const hash16 = poseidon(pixels.slice(180, 192));
    
    // Level 2: Combine 16 hashes into 4 groups of 4
    const level2_hash1 = poseidon([hash1, hash2, hash3, hash4]);
    const level2_hash2 = poseidon([hash5, hash6, hash7, hash8]);
    const level2_hash3 = poseidon([hash9, hash10, hash11, hash12]);
    const level2_hash4 = poseidon([hash13, hash14, hash15, hash16]);
    
    // Final: Combine 4 hashes into 1 final hash
    const finalHash = poseidon([level2_hash1, level2_hash2, level2_hash3, level2_hash4]);
    const hashString = poseidon.F.toString(finalHash);

    return hashString;
}
