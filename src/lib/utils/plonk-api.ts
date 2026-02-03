/**
 * API functions for PLONK/Noir proof generation and verification
 * 
 * NOTE: This now uses client-side processing (no server communication)
 * All proof generation happens in the browser - privacy-first architecture
 * 
 * Uses dynamic imports to avoid SSR issues with browser-only dependencies (WASM, Buffer)
 */

// Dynamic import to avoid SSR issues - only loads in browser
let plonkClientModule: typeof import('./plonk-client') | null = null;

async function getPlonkClient() {
  if (!plonkClientModule) {
    // Only import in browser (not during SSR)
    // Check both window and browser environment
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      plonkClientModule = await import('./plonk-client');
    } else {
      throw new Error('PLONK client can only be used in the browser. This code must run client-side only.');
    }
  }
  return plonkClientModule;
}

export interface PlonkProofResult {
    proof: any;
    publicSignals: string[];
}

export interface PlonkVerificationResult {
    isValid: boolean;
    message: string;
}

/**
 * Generate PLONK proof client-side
 * All processing happens in the browser - no data is sent to the server
 * 
 * @param pixels - Array of 48 RGB pixel values
 * @param hash - Poseidon hash string
 * @returns Proof result with proof bytes (base64) and public inputs
 */
export async function generatePlonkProof(pixels: number[], hash: string): Promise<PlonkProofResult> {
    try {
        // Convert pixels to BigInt array
        const pixelsBig = pixels.map((p) => BigInt(p));
        const expectedHash = BigInt(hash);

        // Dynamically import client module (only in browser)
        const { generateNoirProofClient } = await getPlonkClient();

        // Generate proof on client
        const result = await generateNoirProofClient(pixelsBig, expectedHash);

        return {
            proof: result.proofBytesBase64,
            publicSignals: result.publicInputs
        };
    } catch (error: any) {
        const errorMessage = error?.message ?? 'Failed to generate PLONK proof';
        throw new Error(errorMessage);
    }
}

/**
 * Verify PLONK proof client-side
 * Verification happens in the browser - no data is sent to the server
 * 
 * @param proof - Proof bytes (base64 string) or proof object
 * @param publicSignals - Array of public input strings
 * @returns Verification result
 */
export async function verifyPlonkProof(proof: any, publicSignals: string[]): Promise<PlonkVerificationResult> {
    try {
        // Handle both formats: the proof might be called "proof" or "proofBytesBase64"
        const proofBytesBase64 = typeof proof === 'string' 
            ? proof 
            : (proof.proofBytesBase64 || proof.proof || proof);
        
        // Ensure publicSignals is an array
        const publicInputs = Array.isArray(publicSignals) 
            ? publicSignals 
            : [publicSignals];
        
        // Dynamically import client module (only in browser)
        const { verifyNoirProofClient } = await getPlonkClient();
        
        // Verify proof on client
        const isValid = await verifyNoirProofClient(proofBytesBase64, publicInputs);

        return {
            isValid,
            message: isValid ? 'Proof is valid' : 'Proof is invalid'
        };
    } catch (error: any) {
        const errorMessage = error?.message ?? 'Failed to verify PLONK proof';
        return {
            isValid: false,
            message: errorMessage
        };
    }
}

