import { json } from '@sveltejs/kit';
import * as snarkjs from 'snarkjs';
import { error } from '@sveltejs/kit';

export async function POST({ request }) {
    console.log("Generating proof for image");
    try {
        // Get pixels and hash from request body
        const { pixels, hash } = await request.json();
        
        if (!pixels || !Array.isArray(pixels) || pixels.length !== 48) {
            throw new Error('Invalid pixels array. Expected 48 RGB values.');
        }
        
        if (!hash || typeof hash !== 'string') {
            throw new Error('Invalid hash. Expected a string.');
        }
        
        console.log("Image pixels count:", pixels.length);
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