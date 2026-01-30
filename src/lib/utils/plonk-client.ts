/**
 * Client-side PLONK proof generation and verification
 * All processing happens in the browser - no server communication
 * 
 * This is a client-side implementation for generating and verifying PLONK proofs
 * using Noir and Barretenberg in the browser. It's separate from the server-side
 * implementation in legacy/plonk-backend.ts (which remains as legacy code).
 * 
 * Key differences from server-side:
 * - Initializes WASM modules for Noir and ACVM in the browser
 * - Initializes Barretenberg before creating UltraHonkBackend
 * - Uses browser-native APIs (btoa/atob) for base64 encoding/decoding (no Buffer needed)
 * - Loads circuit from direct import (bundled by Vite)
 */

import { Noir } from "@noir-lang/noir_js";
import { UltraHonkBackend, Barretenberg } from "@aztec/bb.js";
import initNoirC from '@noir-lang/noirc_abi';
import initACVM from '@noir-lang/acvm_js';
import acvm from '@noir-lang/acvm_js/web/acvm_js_bg.wasm?url';
import noirc from '@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm?url';
import circuit from "$lib/circuits/plonk/plonk-8x8.json";

/**
 * Convert Uint8Array to base64 string (browser-native, no Buffer needed)
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  // Use browser's native btoa with binary string conversion
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to Uint8Array (browser-native, no Buffer needed)
 */
function base64ToUint8Array(base64: string): Uint8Array {
  // Use browser's native atob to decode base64
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

let wasmInitialized = false;
let cachedCircuit: any | null = null;
let noirInstance: Noir | null = null;
let backendInstance: UltraHonkBackend | null = null;
let barretenbergInstance: Barretenberg | null = null;

/**
 * Initialize WASM modules for Noir and ACVM
 * Must be called before creating Noir or Backend instances
 */
async function initializeWASM() {
  if (wasmInitialized) {
    return;
  }

  try {
    console.log("[noir-client] Initializing WASM modules...");
    
    // Initialize WASM modules in parallel
    await Promise.all([
      initACVM(fetch(acvm)),
      initNoirC(fetch(noirc))
    ]);
    
    console.log("[noir-client] WASM modules initialized successfully");
    wasmInitialized = true;
  } catch (error: any) {
    console.error("[noir-client] Failed to initialize WASM:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    throw new Error(`Failed to initialize WASM modules: ${error?.message ?? String(error)}`);
  }
}

/**
 * Initialize Barretenberg instance
 * Required before creating UltraHonkBackend
 */
async function initializeBarretenberg() {
  if (barretenbergInstance) {
    return barretenbergInstance;
  }

  try {
    console.log("[noir-client] Initializing Barretenberg...");
    
    // Ensure WASM is initialized first
    await initializeWASM();
    
    // Create Barretenberg instance
    barretenbergInstance = await Barretenberg.new();
    
    console.log("[noir-client] Barretenberg initialized successfully");
    return barretenbergInstance;
  } catch (error: any) {
    console.error("[noir-client] Failed to initialize Barretenberg:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    throw new Error(`Failed to initialize Barretenberg: ${error?.message ?? String(error)}`);
  }
}

function loadCircuitJson() {
  if (!cachedCircuit) {
    // Import circuit directly - Vite bundles it for client
    cachedCircuit = circuit;
  }
  return cachedCircuit;
}

async function getNoirInstance() {
  if (!noirInstance) {
    try {
      console.log("[noir-client] Initializing Noir instance...");
      
      // Ensure WASM is initialized first
      await initializeWASM();
      
      const circuitJson = loadCircuitJson();
      console.log("[noir-client] Circuit JSON loaded, size:", JSON.stringify(circuitJson).length, "chars");
      console.log("[noir-client] Circuit has bytecode:", !!circuitJson.bytecode);
      console.log("[noir-client] Initializing Noir with circuit...");
      
      // Initialize Noir
      noirInstance = new Noir(circuitJson);
      
      // Wait for Noir to be ready if needed
      if (noirInstance && typeof noirInstance.init === 'function') {
        await noirInstance.init();
      }
      
      console.log("[noir-client] Noir instance initialized successfully");
    } catch (error: any) {
      console.error("[noir-client] Failed to initialize Noir:", {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        toString: String(error)
      });
      throw new Error(`Failed to initialize Noir: ${error?.message ?? String(error)}`);
    }
  }
  return noirInstance;
}

async function getBackendInstance() {
  if (!backendInstance) {
    try {
      console.log("[noir-client] Initializing backend instance...");
      
      // Ensure Barretenberg is initialized first (required before creating UltraHonkBackend)
      await initializeBarretenberg();
      
      const circuitJson = loadCircuitJson();
      const bytecode = circuitJson.bytecode ?? circuitJson;
      
      console.log("[noir-client] Creating UltraHonkBackend...");
      // Note: UltraHonkBackend constructor signature may differ from docs
      // Initializing Barretenberg before ensures it's available globally
      backendInstance = new UltraHonkBackend(bytecode);
      
      console.log("[noir-client] Backend instance initialized successfully");
    } catch (error: any) {
      console.error("[noir-client] Failed to initialize backend:", {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      throw new Error(`Failed to initialize backend: ${error?.message ?? String(error)}`);
    }
  }
  return backendInstance;
}

/* ----------------------------------------------------------
   GENERATE PROOF (on client)
---------------------------------------------------------- */

export async function generateNoirProofClient(
  pixels: bigint[],
  expectedHash: bigint
) {
  try {
    console.log("[noir-client] Starting proof generation...");
    console.log("[noir-client] Inputs:", {
      pixelsLength: pixels.length,
      expectedHash: expectedHash.toString()
    });

    // 1) Initialize Noir instance
    console.log("[noir-client] Step 1: Getting Noir instance...");
    const noir = await getNoirInstance();
    console.log("[noir-client] Noir instance created");

    // 2) Generate witness
    console.log("[noir-client] Step 2: Executing circuit to generate witness...");
    
    // Validate inputs (8x8 = 64 pixels × 3 channels = 192 values)
    if (pixels.length !== 192) {
      throw new Error(`Expected 192 pixels, got ${pixels.length}`);
    }
    
    const validPixels = pixels.map((p, i) => {
      if (typeof p !== 'bigint') {
        throw new Error(`Pixel at index ${i} is not a BigInt: ${typeof p}`);
      }
      return p;
    });
    
    if (typeof expectedHash !== 'bigint') {
      throw new Error(`Expected hash is not a BigInt: ${typeof expectedHash}`);
    }
    
    const inputs = {
      pixels: validPixels,
      expected_hash: expectedHash
    };
    
    console.log("[noir-client] Circuit inputs prepared:", {
      pixelsLength: inputs.pixels.length,
      expected_hash: inputs.expected_hash.toString(),
      firstPixel: inputs.pixels[0]?.toString(),
      lastPixel: inputs.pixels[191]?.toString()
    });

    let witness;
    try {
      // Convert BigInt to strings for Noir execute
      const executeInputs = {
        pixels: inputs.pixels.map(p => p.toString()),
        expected_hash: inputs.expected_hash.toString()
      };
      
      console.log("[noir-client] Executing circuit with Noir...");
      const result = await noir.execute(executeInputs as any);
      
      if (!result) {
        throw new Error("Noir execute returned null or undefined");
      }
      
      if (!result.witness) {
        console.error("[noir-client] Result structure:", Object.keys(result));
        throw new Error("Noir execute returned result without witness property");
      }
      
      witness = result.witness;
      console.log("[noir-client] Witness generated successfully");
    } catch (witnessError: any) {
      console.error("[noir-client] Witness generation failed:", {
        message: witnessError?.message,
        stack: witnessError?.stack,
        name: witnessError?.name,
        toString: String(witnessError),
        cause: witnessError?.cause
      });
      
      let errorMsg = witnessError?.message ?? String(witnessError);
      if (errorMsg.includes("unwrap_throw") || errorMsg.includes("Result")) {
        errorMsg = `Circuit execution failed. This usually means:
1. The circuit inputs don't match the expected format
2. The circuit compilation is out of sync with the source code
3. There's an issue with the Noir initialization

Please ensure:
- pixels is an array of exactly 192 BigInt values (8x8 = 64 pixels × 3 channels)
- expected_hash is a single BigInt value
- The circuit has been compiled with: cd src/lib/plonk && nargo compile

Original error: ${errorMsg}`;
      }
      
      throw new Error(`Failed to generate witness: ${errorMsg}`);
    }

    // 3) Get backend instance
    console.log("[noir-client] Step 3: Getting backend instance...");
    const backend = await getBackendInstance();
    console.log("[noir-client] Backend instance created");

    // 4) Generate proof
    console.log("[noir-client] Step 4: Generating proof...");
    let proof;
    try {
      proof = await backend.generateProof(witness);
      console.log("[noir-client] Proof generated successfully");
    } catch (proofError: any) {
      console.error("[noir-client] Proof generation failed:", {
        message: proofError?.message,
        stack: proofError?.stack,
        name: proofError?.name
      });
      throw new Error(`Failed to generate proof: ${proofError?.message ?? String(proofError)}`);
    }

    // 5) Verify locally (sanity check)
    console.log("[noir-client] Step 5: Verifying proof locally...");
    let ok;
    try {
      ok = await backend.verifyProof(proof);
      console.log("[noir-client] Local verification result:", ok);
    } catch (verifyError: any) {
      console.error("[noir-client] Local verification failed:", {
        message: verifyError?.message,
        stack: verifyError?.stack
      });
      throw new Error(`Failed to verify proof locally: ${verifyError?.message ?? String(verifyError)}`);
    }

    if (!ok) {
      throw new Error("Generated proof does NOT verify locally — something is wrong");
    }

    // 6) Serialize to JSON-safe format
    //    - proof.proof: Uint8Array → base64 (using browser-native APIs)
    //    - publicInputs: bigint[] → string[]
    console.log("[noir-client] Step 6: Serializing proof...");
    const proofBytesBase64 = uint8ArrayToBase64(proof.proof);
    const publicInputs = (proof.publicInputs as unknown as bigint[]).map((input) =>
      input.toString()
    );
    console.log("[noir-client] Proof serialized, publicInputs count:", publicInputs.length);

    return {
      proofBytesBase64,
      publicInputs
    };
  } catch (error: any) {
    console.error("[noir-client] Error in generateNoirProofClient:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      cause: error?.cause
    });
    throw error;
  }
}

/* ----------------------------------------------------------
   VERIFY PROOF (on client)
---------------------------------------------------------- */

export async function verifyNoirProofClient(
  proofBytesBase64: string,
  publicInputsStrings: string[]
) {
  try {
    console.log("[noir-client] Starting proof verification...");
    console.log("[noir-client] Inputs:", {
      proofLength: proofBytesBase64.length,
      publicInputsCount: publicInputsStrings.length
    });

    // 1) Get backend instance
    console.log("[noir-client] Step 1: Getting backend instance...");
    const backend = await getBackendInstance();
    console.log("[noir-client] Backend instance created");

    // 2) Deserialize bytes (using browser-native APIs)
    console.log("[noir-client] Step 2: Deserializing proof bytes...");
    const proofBytes = base64ToUint8Array(proofBytesBase64);
    console.log("[noir-client] Proof bytes deserialized, length:", proofBytes.length);

    // 3) Deserialize Public Inputs
    console.log("[noir-client] Step 3: Deserializing public inputs...");
    const publicInputs = publicInputsStrings.map((p) => BigInt(p));
    console.log("[noir-client] Public inputs deserialized, count:", publicInputs.length);

    // 4) Reconstruct proof object in the exact format expected by bb.js
    console.log("[noir-client] Step 4: Reconstructing proof object...");
    const proof = {
      proof: proofBytes,        // Uint8Array
      publicInputs              // bigint[]
    } as any;
    console.log("[noir-client] Proof object reconstructed");

    // 5) Verify
    console.log("[noir-client] Step 5: Verifying proof...");
    const ok = await backend.verifyProof(proof);
    console.log("[noir-client] Verification result:", ok);
    
    return ok;
  } catch (error: any) {
    console.error("[noir-client] Verification failed:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    throw error;
  }
}
