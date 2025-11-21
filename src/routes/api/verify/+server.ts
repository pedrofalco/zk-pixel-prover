import { json } from '@sveltejs/kit';
import * as snarkjs from 'snarkjs';
import { error } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { getCircuitPath } from '$lib/utils/circuit-paths';

export async function POST({ request, fetch }) {
    try {
        const { proof, publicSignals } = await request.json();
        
        // Get the reference image hash (the fixed image we're verifying against)
        const referenceResponse = await fetch('/api/reference-hash');
        if (!referenceResponse.ok) {
            throw new Error('Failed to load reference image hash');
        }
        const referenceData = await referenceResponse.json();
        const referenceHash = referenceData.data.hash;
        
        // Resolve path for both development and production
        const vKeyPath = getCircuitPath('circuits/keys/verification_key.json');
        const vKey = JSON.parse(readFileSync(vKeyPath, 'utf-8'));
        
        // Verify the proof mathematically
        const isMathematicallyValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
        
        // Verify that the hash in the proof matches the reference image hash
        // The hash is the first (and only) public signal
        const proofHash = publicSignals[0];
        const hashMatches = proofHash === referenceHash;
        
        // Both checks must pass
        const isValid = isMathematicallyValid && hashMatches;

        return json({
            success: true,
            data: {
                isValid,
                message: isValid 
                    ? "✅ Verification OK - This proof matches the reference image" 
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