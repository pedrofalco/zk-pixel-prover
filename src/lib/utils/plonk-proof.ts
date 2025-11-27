/**
 * PLONK proof generation and verification utilities for frontend
 */

import { generatePlonkProof, verifyPlonkProof, type PlonkProofResult, type PlonkVerificationResult } from './plonk-api';

export async function handleGeneratePlonkProof(
    pixels: number[],
    hash: string,
    setLoading: (loading: boolean) => void,
    setError: (error: string | null) => void,
    setResult: (result: PlonkProofResult) => void
): Promise<void> {
    setLoading(true);
    setError(null);

    try {
        const result = await generatePlonkProof(pixels, hash);
        setResult(result);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate PLONK proof';
        setError(errorMessage);
        console.error('PLONK Proof generation error:', err);
    } finally {
        setLoading(false);
    }
}

export async function handleVerifyPlonkProof(
    proof: any,
    publicSignals: string[],
    setLoading: (loading: boolean) => void,
    setError: (error: string | null) => void,
    setResult: (result: PlonkVerificationResult) => void
): Promise<void> {
    if (!proof || !publicSignals) {
        setError('Please upload a proof file first');
        return;
    }

    setLoading(true);
    setError(null);

    try {
        const result = await verifyPlonkProof(proof, publicSignals);
        setResult(result);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to verify PLONK proof';
        setError(errorMessage);
        console.error('PLONK Verification error:', err);
    } finally {
        setLoading(false);
    }
}

