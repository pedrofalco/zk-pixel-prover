/**
 * Utility functions for image processing
 */

export async function processImageFile(file: File): Promise<{ pixels: number[]; hash: string }> {
    // Step 1: Process image to get pixels
    const formData = new FormData();
    formData.append('image', file);

    const processResponse = await fetch('/api/process-image', {
        method: 'POST',
        body: formData
    });

    if (!processResponse.ok) {
        const errorData = await processResponse.json();
        throw new Error(errorData.message || 'Failed to process image');
    }

    const processData = await processResponse.json();
    const pixels = processData.data.pixels;

    // Step 2: Calculate hash
    const hashResponse = await fetch('/api/calculate-hash', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pixels })
    });

    if (!hashResponse.ok) {
        const errorData = await hashResponse.json();
        throw new Error(errorData.message || 'Failed to calculate hash');
    }

    const hashData = await hashResponse.json();
    const hash = hashData.data.hash;

    return { pixels, hash };
}

