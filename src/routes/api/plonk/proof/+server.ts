// src/routes/api/plonk/proof/+server.ts
import { json, error } from "@sveltejs/kit";
import { generateNoirProof } from "$lib/utils/noir-proof";

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
