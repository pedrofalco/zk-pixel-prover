/**
 * API functions for PLONK/Noir proof generation and verification
 */

export interface PlonkProofResult {
    proof: any;
    publicSignals: string[];
}

export interface PlonkVerificationResult {
    isValid: boolean;
    message: string;
}

export async function generatePlonkProof(pixels: number[], hash: string): Promise<PlonkProofResult> {
    const response = await fetch('/api/plonk/proof', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            pixels,
            hash
        })
    });
    
    if (!response.ok) {
        let errorMessage = 'Failed to generate PLONK proof';
        try {
        const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
            // If response is not JSON, try to get text
            try {
                const text = await response.text();
                errorMessage = text || errorMessage;
            } catch (e2) {
                // Fallback to status text
                errorMessage = response.statusText || errorMessage;
            }
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Handle both response formats: { success: true, data: {...} } and { success: true, ...result }
    if (data.data) {
        return {
            proof: data.data.proofBytesBase64,
            publicSignals: data.data.publicInputs
        };
    } else {
        return {
            proof: data.proofBytesBase64,
            publicSignals: data.publicInputs
        };
    }
}

export async function verifyPlonkProof(proof: any, publicSignals: string[]): Promise<PlonkVerificationResult> {
    // The endpoint expects proofBytesBase64 and publicInputs
    // Handle both formats: the proof might be called "proof" or "proofBytesBase64"
    const proofBytesBase64 = typeof proof === 'string' 
        ? proof 
        : (proof.proofBytesBase64 || proof.proof || proof);
    
    // Ensure publicSignals is an array
    const publicInputs = Array.isArray(publicSignals) 
        ? publicSignals 
        : [publicSignals];
    
    const response = await fetch('/api/plonk/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            proofBytesBase64,
            publicInputs
        })
    });

    if (!response.ok) {
        let errorMessage = 'Failed to verify PLONK proof';
        try {
        const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
            try {
                const text = await response.text();
                errorMessage = text || errorMessage;
            } catch (e2) {
                errorMessage = response.statusText || errorMessage;
            }
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Handle both response formats
    if (data.data) {
    return data.data;
    } else {
        return {
            isValid: data.success || false,
            message: data.message || (data.success ? 'Proof is valid' : 'Proof is invalid')
        };
    }
}

