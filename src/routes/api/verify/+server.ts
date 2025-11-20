import { json } from '@sveltejs/kit';
import * as snarkjs from 'snarkjs';
import { error } from '@sveltejs/kit';


export async function POST({ request, fetch }) {
    try {
        const { proof, publicSignals } = await request.json();
        
        // Get the witness image hash (the fixed image we're verifying against)
        const witnessResponse = await fetch('/api/witness-hash');
        if (!witnessResponse.ok) {
            throw new Error('Failed to load witness image hash');
        }
        const witnessData = await witnessResponse.json();
        const witnessHash = witnessData.data.hash;
        
        // Use event.fetch instead of global fetch
        const vKeyResponse = await fetch('/src/lib/circuits/keys/verification_key.json');
        const vKey = await vKeyResponse.json();
        
        // Verify the proof mathematically
        const isMathematicallyValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
        
        // Verify that the hash in the proof matches the witness image hash
        // The hash is the first (and only) public signal
        const proofHash = publicSignals[0];
        const hashMatches = proofHash === witnessHash;
        
        // Both checks must pass
        const isValid = isMathematicallyValid && hashMatches;

        return json({
            success: true,
            data: {
                isValid,
                message: isValid 
                    ? "✅ Verification OK - This proof matches the witness image" 
                    : !isMathematicallyValid 
                        ? "❌ Invalid proof - Mathematical verification failed"
                        : "❌ Proof does not match - This proof was generated for a different image"
            }
        });
    } catch (err) {
        console.error('Verification error:', err);
        throw error(500, {
            message: `Failed to verify proof: ${err instanceof Error ? err.message : String(err)}`
        });
    }
} 