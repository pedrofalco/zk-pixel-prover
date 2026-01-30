/**
 * Utility functions for image processing
 * 
 * NOTE: This now uses client-side processing (no server communication)
 * All image processing and hash calculation happens in the browser
 */

import { processImageFileClient } from './image-processing-client';

/**
 * Process an image file to extract RGB pixels and calculate hash
 * All processing happens client-side - no data is sent to the server
 * 
 * @param file - Image file (JPEG, PNG, WebP, GIF)
 * @returns Object with pixels array (48 RGB values) and hash string
 */
export async function processImageFile(file: File): Promise<{ pixels: number[]; hash: string }> {
    // Use client-side processing (privacy-first: server never sees the image)
    return processImageFileClient(file);
}

