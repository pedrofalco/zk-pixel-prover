import { json } from '@sveltejs/kit';
import * as snarkjs from 'snarkjs';
import { error } from '@sveltejs/kit';


export async function POST({ request, fetch }) {
    try {
        const { proof, publicSignals } = await request.json();
        
        // Use event.fetch instead of global fetch
        const vKeyResponse = await fetch('/src/lib/circuits/keys/verification_key.json');
        const vKey = await vKeyResponse.json();
        
        // Verify the proof
        const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

        return json({
            success: true,
            data: {
                isValid,
                message: isValid ? "Verification OK" : "Invalid proof"
            }
        });
    } catch (err) {
        console.error('Verification error:', err);
        throw error(500, {
            message: `Failed to verify proof: ${err instanceof Error ? err.message : String(err)}`
        });
    }
} 