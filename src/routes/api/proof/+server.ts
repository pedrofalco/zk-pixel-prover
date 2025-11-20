import { json } from '@sveltejs/kit';
import * as snarkjs from 'snarkjs';
import { error } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST() {
    console.log("Generating proof for image");
    try {
        // Read image data from input.json
        const inputPath = join(process.cwd(), 'static', 'input.json');
        const inputData = JSON.parse(readFileSync(inputPath, 'utf-8'));
        
        const { pixels, hash } = inputData;
        
        console.log("Image pixels:", pixels);
        console.log("Image hash:", hash);
        
        // Generate proof with pixels and hash
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            {
                pixels: pixels,
                hash: hash
            },
            "src/lib/circuits/compiled/circuit_js/circuit.wasm",
            "src/lib/circuits/keys/circuit_0000.zkey"
        );

        console.log("Proof generated: ", proof);
        console.log("Public signals: ", publicSignals);
        
        return json({
            success: true,
            data: {
                proof,
                publicSignals
            }
        });
    } catch (err) {
        console.error('Proof generation error:', err);
        throw error(500, err instanceof Error ? err.message : String(err));
    }
} 