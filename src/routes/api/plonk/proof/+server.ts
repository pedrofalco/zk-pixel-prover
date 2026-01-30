/**
 * ============================================================================
 * ⚠️  DEPRECATED ENDPOINT - LEGACY CODE ⚠️
 * ============================================================================
 * 
 * This endpoint is DEPRECATED and NO LONGER USED by the application.
 * 
 * **Migration Status**: PLONK proof generation has been moved to client-side
 * (Phase 2 of migration to web3/privacy-first architecture).
 * 
 * **Why deprecated?**
 * - Privacy: The server should NOT see user pixels, hash, or witness
 * - Architecture: Moving to client-side processing aligns with web3 principles
 * - Current implementation: Uses `plonk-backend-client.ts` in the browser
 * 
 * **Current client-side implementation:**
 * - File: `src/lib/utils/plonk-client.ts`
 * - Function: `generateNoirProofClient()`
 * - Initializes WASM modules (Noir, ACVM, Barretenberg) in browser
 * - Generates proof entirely on client
 * - Uses Buffer polyfill for base64 encoding
 * 
 * **This endpoint is kept for:**
 * - Historical reference
 * - Potential rollback if needed
 * - Understanding the migration path
 * 
 * **DO NOT USE** this endpoint in new code.
 * Use `generatePlonkProof()` from `plonk-api.ts` instead, which calls the client-side backend.
 * 
 * ============================================================================
 */

// src/routes/api/plonk/proof/+server.ts
import { json, error } from "@sveltejs/kit";
import { generateNoirProof } from "$lib/utils/plonk-backend";

export async function POST({ request }) {
  try {
    const { pixels, hash } = await request.json();

    console.log("[plonk/proof] Received request:", {
      pixelsLength: pixels?.length,
      hashType: typeof hash,
      hashValue: hash
    });

    if (!Array.isArray(pixels)) {
      throw new Error("pixels must be array");
    }
    if (pixels.length !== 48) {
      throw new Error(`Expected 48 pixels, got ${pixels.length}`);
    }
    if (typeof hash !== "string") {
      throw new Error("hash must be string");
    }

    // Normalización: Field = BigInt
    const pixelsBig = pixels.map((p) => BigInt(p));
    const expectedHash = BigInt(hash);

    console.log("[plonk/proof] Calling generateNoirProof...");
    const result = await generateNoirProof(pixelsBig, expectedHash);
    console.log("[plonk/proof] Proof generated successfully");

    return json({
      success: true,
      data: {
        proofBytesBase64: result.proofBytesBase64,
        publicInputs: result.publicInputs
      }
    });
  } catch (e: any) {
    console.error("[plonk/proof] Error details:", {
      message: e?.message,
      stack: e?.stack,
      name: e?.name,
      cause: e?.cause,
      toString: String(e)
    });
    
    // Try to extract more details from the error
    let errorMessage = e?.message ?? "Unknown error";
    
    // If it's a WASM/Rust error, try to get more info
    if (errorMessage.includes("unwrap_throw") || errorMessage.includes("Result")) {
      errorMessage = `PLONK proof generation failed: ${errorMessage}. This might be due to circuit initialization or witness generation issues.`;
    }
    
    throw error(500, errorMessage);
  }
}
