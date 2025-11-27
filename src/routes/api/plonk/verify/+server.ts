// src/routes/api/plonk/verify/+server.ts
import { json, error } from "@sveltejs/kit";
import { verifyNoirProof } from "$lib/utils/noir-proof";

export async function POST({ request, fetch }) {
  try {
    const body = await request.json();
    
    // Support both naming conventions:
    // - proofBytesBase64 / publicInputs (from API)
    // - proof / publicSignals (from downloaded JSON file)
    const proofBytesBase64 = body.proofBytesBase64 || body.proof;
    const publicInputs = body.publicInputs || body.publicSignals;

    console.log("[plonk/verify] Received request:", {
      hasProofBytesBase64: !!proofBytesBase64,
      hasPublicInputs: !!publicInputs,
      publicInputsType: Array.isArray(publicInputs) ? 'array' : typeof publicInputs,
      publicInputsLength: Array.isArray(publicInputs) ? publicInputs.length : 'N/A'
    });

    if (!proofBytesBase64) {
      throw new Error("Missing proof. Expected 'proofBytesBase64' or 'proof' field");
    }
    
    if (typeof proofBytesBase64 !== "string") {
      throw new Error(`proofBytesBase64 must be string, got ${typeof proofBytesBase64}`);
    }
    
    if (!publicInputs) {
      throw new Error("Missing public inputs. Expected 'publicInputs' or 'publicSignals' field");
    }
    
    // Normalize publicInputs to array
    const normalizedInputs = Array.isArray(publicInputs) ? publicInputs : [publicInputs];
    
    // Get the reference image hash (the fixed image we're verifying against)
    console.log("[plonk/verify] Fetching reference hash...");
    const referenceResponse = await fetch('/api/reference-hash');
    if (!referenceResponse.ok) {
      throw new Error('Failed to load reference image hash');
    }
    const referenceData = await referenceResponse.json();
    const referenceHash = referenceData.data.hash;
    console.log("[plonk/verify] Reference hash:", referenceHash);

    // Verify the proof mathematically
    console.log("[plonk/verify] Verifying proof mathematically...");
    const isMathematicallyValid = await verifyNoirProof(proofBytesBase64, normalizedInputs);
    console.log("[plonk/verify] Mathematical verification result:", isMathematicallyValid);

    // Verify that the hash in the proof matches the reference image hash
    // The hash is the first (and only) public signal
    const proofHash = normalizedInputs[0];
    
    // Normalize both hashes to strings for comparison
    let proofHashStr = String(proofHash).trim();
    const referenceHashStr = String(referenceHash).trim();
    
    // Convert proofHash to decimal if it's in hexadecimal format
    if (proofHashStr.startsWith('0x') || proofHashStr.startsWith('0X')) {
      // Remove '0x' prefix and convert hex to BigInt, then to decimal string
      const hexValue = proofHashStr.substring(2);
      const decimalValue = BigInt('0x' + hexValue).toString();
      console.log("[plonk/verify] Converted hex hash to decimal:", {
        hex: proofHashStr,
        decimal: decimalValue
      });
      proofHashStr = decimalValue;
    }
    
    // Compare as decimal strings
    const hashMatches = proofHashStr === referenceHashStr;
    
    console.log("[plonk/verify] Hash comparison:", {
      proofHash: proofHashStr,
      proofHashType: typeof proofHashStr,
      proofHashLength: proofHashStr.length,
      referenceHash: referenceHashStr,
      referenceHashType: typeof referenceHashStr,
      referenceHashLength: referenceHashStr.length,
      hashMatches,
      areEqual: proofHashStr === referenceHashStr
    });
    
    // If they don't match, log more details for debugging
    if (!hashMatches) {
      console.log("[plonk/verify] Hash mismatch details:", {
        proofHashFirst20: proofHashStr.substring(0, 20),
        referenceHashFirst20: referenceHashStr.substring(0, 20),
        proofHashLast20: proofHashStr.substring(Math.max(0, proofHashStr.length - 20)),
        referenceHashLast20: referenceHashStr.substring(Math.max(0, referenceHashStr.length - 20))
      });
    }

    // Both checks must pass
    const isValid = isMathematicallyValid && hashMatches;
    
    // Additional debug: log the exact values being compared
    console.log("[plonk/verify] Final verification:", {
      isMathematicallyValid,
      hashMatches,
      isValid,
      proofHashExact: JSON.stringify(proofHashStr),
      referenceHashExact: JSON.stringify(referenceHashStr)
    });

    let message;
    if (isValid) {
      message = "✅ Verification OK - This proof matches the reference image (sample_4x4.jpeg)";
    } else if (!isMathematicallyValid) {
      message = "❌ Invalid proof - Mathematical verification failed";
    } else {
      message = "❌ Proof does not match - This proof was generated for a different image";
    }

    return json({
      success: true,
      data: {
        isValid,
        message
      }
    });
  } catch (e: any) {
    console.error("[plonk/verify] Error details:", {
      message: e?.message,
      stack: e?.stack,
      name: e?.name
    });
    throw error(500, e?.message ?? "Unknown error");
  }
}
