import { json } from '@sveltejs/kit';
import * as snarkjs from 'snarkjs';
import { error } from '@sveltejs/kit';

export async function POST() {
    console.log("Generating proof");
    try {
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            { secret: 12345 },
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