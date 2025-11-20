/**
 * Proof generation and verification handlers
 */

import { generateProof, verifyProof } from './api';
import type { ProofResult, VerificationResult } from './api';

export async function handleGenerateProof(
    pixels: number[],
    hash: string,
    setLoading: (loading: boolean) => void,
    setError: (error: string) => void,
    setResult: (result: ProofResult) => void
): Promise<void> {
    setLoading(true);
    setError('An error occurred');

    try {
        const result = await generateProof(pixels, hash);
        console.log('Proof generated:', result);
        setResult(result);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        console.error('Error:', err);
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
}

export async function handleVerifyProof(
    proof: any,
    publicSignals: any,
    setLoading: (loading: boolean) => void,
    setError: (error: string) => void,
    setResult: (result: VerificationResult) => void
): Promise<void> {
    if (!proof || !publicSignals) {
        setError('Please upload a proof file first');
        return;
    }

    setLoading(true);
    setError('An error occurred');

    try {
        const result = await verifyProof(proof, publicSignals);
        setResult(result);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        console.error('Error:', err);
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
}

