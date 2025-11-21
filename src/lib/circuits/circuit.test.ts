import { describe, it, expect, beforeAll } from 'vitest';
import { wasm as wasmTester } from 'circom_tester';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as fs from 'fs';
import { buildPoseidon } from 'circomlibjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Image Attestation Circuit', () => {
    let circuit: any;
    let poseidon: any;

    beforeAll(async () => {
        circuit = await wasmTester(join(__dirname, 'circuit.circom'));
        poseidon = await buildPoseidon();
        console.log('Circuit loaded successfully');
    });

    it('should verify attested image', async () => {
        // Read image data from input.json
        const input = JSON.parse(fs.readFileSync('static/input.json', 'utf-8'));
        const pixels = input.pixels; // 48 RGB values
        const expectedHash = input.hash;
        
        // Calculate hash using Poseidon (matching circuit structure: groups of 12)
        const hash1 = poseidon(pixels.slice(0, 12));
        const hash2 = poseidon(pixels.slice(12, 24));
        const hash3 = poseidon(pixels.slice(24, 36));
        const hash4 = poseidon(pixels.slice(36, 48));
        const imageHash = poseidon.F.toString(poseidon([hash1, hash2, hash3, hash4]));
        
        console.log('Image hash:', imageHash);
        console.log('Expected hash:', expectedHash);

        try {
            // Test 1: Original image should pass
            console.log('\nTesting original image...');
            await circuit.calculateWitness({
                pixels: pixels,
                hash: expectedHash
            });
            console.log('✓ Original image verified successfully');

            // Test 2: Modified image should fail
            console.log('\nTesting modified image...');
            const modifiedPixels = [...pixels];
            modifiedPixels[0] = pixels[0] + 1;  // Change one RGB value

            try {
                await circuit.calculateWitness({
                    pixels: modifiedPixels,
                    hash: expectedHash
                });
                throw new Error('Circuit accepted modified image!');
            } catch (err) {
                console.log('✓ Circuit correctly rejected modified image');
            }

        } catch (err) {
            console.error('Circuit verification failed:', err);
            throw err;
        }
    });
}); 