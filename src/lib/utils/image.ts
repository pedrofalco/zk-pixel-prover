/**
 * Convert RGB pixel array to CSS color string
 * @param pixels - Flat array: [R1, G1, B1, R2, G2, B2, ..., R16, G16, B16]
 * @param index - Pixel index (0-15)
 * @returns RGB color string
 */
export function pixelToColor(pixels: number[], index: number): string {
    const baseIndex = index * 3;
    const r = pixels[baseIndex];
    const g = pixels[baseIndex + 1];
    const b = pixels[baseIndex + 2];
    return `rgb(${r}, ${g}, ${b})`;
}

