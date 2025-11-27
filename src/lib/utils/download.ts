/**
 * Download a JSON object as a file
 */
export function downloadJSON(data: any, filename: string = 'data.json'): void {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Download an image file from a URL
 */
export async function downloadImage(imagePath: string, filename: string, errorMessage: string = 'Failed to download image'): Promise<void> {
    try {
        const response = await fetch(imagePath);
        if (!response.ok) {
            throw new Error(errorMessage);
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error(`Error downloading image (${filename}):`, err);
        alert(errorMessage);
    }
}

/**
 * Download a proof file with appropriate filename based on proof system
 */
export function downloadProof(result: any, proofSystem: 'groth16' | 'plonk' = 'groth16'): void {
    if (!result) return;
    const filename = proofSystem === 'groth16' ? 'proof.json' : 'plonk-proof.json';
    downloadJSON(result, filename);
}

