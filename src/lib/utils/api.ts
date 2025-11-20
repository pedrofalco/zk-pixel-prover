/**
 * API functions for proof generation and verification
 */

export interface ProofResult {
    proof: any;
    publicSignals: any;
}

export interface VerificationResult {
    isValid: boolean;
    message: string;
}

export async function generateProof(): Promise<ProofResult> {
    const response = await fetch('/api/proof', {
        method: 'POST'
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate proof');
    }

    const data = await response.json();
    return data.data;
}

export async function verifyProof(proof: any, publicSignals: any): Promise<VerificationResult> {
    const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            proof,
            publicSignals
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify proof');
    }

    const data = await response.json();
    return data.data;
}

