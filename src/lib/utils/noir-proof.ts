// src/lib/utils/noir-proof.ts
import { readFileSync } from "fs";
import { Noir } from "@noir-lang/noir_js";
import { UltraHonkBackend } from "@aztec/bb.js";
import { getNoirCircuitPath } from "./noir-circuit-paths";

let cachedCircuit: any | null = null;
let noirInstance: Noir | null = null;
let backendInstance: UltraHonkBackend | null = null;

function loadCircuitJson() {
  if (!cachedCircuit) {
    const circuitPath = getNoirCircuitPath("plonk/plonk.json");
    cachedCircuit = JSON.parse(readFileSync(circuitPath, "utf-8"));
  }
  return cachedCircuit;
}

async function getNoirInstance() {
  if (!noirInstance) {
    try {
      console.log("[noir-proof] Initializing Noir instance...");
      const circuitJson = loadCircuitJson();
      console.log("[noir-proof] Circuit JSON loaded, size:", JSON.stringify(circuitJson).length, "chars");
      console.log("[noir-proof] Circuit has bytecode:", !!circuitJson.bytecode);
      console.log("[noir-proof] Initializing Noir with circuit...");
      
      // Initialize Noir - it might need to be awaited
      noirInstance = new Noir(circuitJson);
      
      // Wait for Noir to be ready if needed
      if (noirInstance && typeof noirInstance.init === 'function') {
        await noirInstance.init();
      }
      
      console.log("[noir-proof] Noir instance initialized successfully");
    } catch (error: any) {
      console.error("[noir-proof] Failed to initialize Noir:", {
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
      console.log("[noir-proof] Initializing backend instance...");
      const circuitJson = loadCircuitJson();
      const bytecode = circuitJson.bytecode ?? circuitJson;
      console.log("[noir-proof] Creating UltraHonkBackend...");
      backendInstance = new UltraHonkBackend(bytecode);
      console.log("[noir-proof] Backend instance initialized successfully");
    } catch (error: any) {
      console.error("[noir-proof] Failed to initialize backend:", {
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
   GENERATE PROOF (on server)
---------------------------------------------------------- */

export async function generateNoirProof(
  pixels: bigint[],
  expectedHash: bigint
) {
  try {
    console.log("[noir-proof] Starting proof generation...");
    console.log("[noir-proof] Inputs:", {
      pixelsLength: pixels.length,
      expectedHash: expectedHash.toString()
    });

    // 1) Instanciar Noir con ACIR
    console.log("[noir-proof] Step 1: Getting Noir instance...");
    const noir = await getNoirInstance();
    console.log("[noir-proof] Noir instance created");

    // 2) Generar witness
    //    Noir requiere que los nombres coincidan EXACTO con tu main()
    console.log("[noir-proof] Step 2: Executing circuit to generate witness...");
    
    // Validar que pixels tenga exactamente 48 elementos
    if (pixels.length !== 48) {
      throw new Error(`Expected 48 pixels, got ${pixels.length}`);
    }
    
    // Validar que todos los valores sean BigInt válidos
    const validPixels = pixels.map((p, i) => {
      if (typeof p !== 'bigint') {
        throw new Error(`Pixel at index ${i} is not a BigInt: ${typeof p}`);
      }
      return p;
    });
    
    // Validar que expectedHash sea BigInt
    if (typeof expectedHash !== 'bigint') {
      throw new Error(`Expected hash is not a BigInt: ${typeof expectedHash}`);
    }
    
    const inputs = {
      pixels: validPixels,
      expected_hash: expectedHash
    };
    console.log("[noir-proof] Circuit inputs prepared:", {
      pixelsLength: inputs.pixels.length,
      expected_hash: inputs.expected_hash.toString(),
      firstPixel: inputs.pixels[0]?.toString(),
      lastPixel: inputs.pixels[47]?.toString()
    });

    let witness;
    try {
      // Noir execute expects inputs in a specific format
      console.log("[noir-proof] Calling noir.execute with inputs...");
      console.log("[noir-proof] Input structure:", {
        hasPixels: !!inputs.pixels,
        pixelsType: Array.isArray(inputs.pixels) ? 'array' : typeof inputs.pixels,
        pixelsLength: inputs.pixels?.length,
        hasExpectedHash: !!inputs.expected_hash,
        expectedHashType: typeof inputs.expected_hash,
        firstPixelValue: inputs.pixels[0]?.toString(),
        expectedHashValue: inputs.expected_hash.toString()
      });
      
      // Noir execute might expect different formats - try multiple approaches
      // According to Noir docs, inputs should match the function signature exactly
      // Some versions expect strings, others expect BigInt - let's try both
      
      // First, try with the format that matches the circuit signature exactly
      // The circuit expects: pixels: [Field; 48], expected_hash: pub Field
      // Field in Noir is typically represented as a string or number
      
      console.log("[noir-proof] Preparing inputs for Noir execute...");
      
      // Try converting BigInt to strings (Noir might expect this)
      const executeInputs = {
        pixels: inputs.pixels.map(p => {
          // Ensure the value is within valid Field range
          const val = p.toString();
          // Validate pixel values are reasonable (0-255 for RGB)
          const num = Number(val);
          if (num < 0 || num > 255) {
            console.warn(`[noir-proof] Pixel value ${num} is outside typical RGB range (0-255)`);
          }
          return val;
        }),
        expected_hash: inputs.expected_hash.toString()
      };
      
      console.log("[noir-proof] Input format:", {
        pixelsType: typeof executeInputs.pixels[0],
        pixelsLength: executeInputs.pixels.length,
        expectedHashType: typeof executeInputs.expected_hash,
        firstPixel: executeInputs.pixels[0],
        expectedHash: executeInputs.expected_hash.substring(0, 20) + "..."
      });
      
      console.log("[noir-proof] Executing circuit with Noir...");
      const result = await noir.execute(executeInputs as any);
      
      if (!result) {
        throw new Error("Noir execute returned null or undefined");
      }
      
      if (!result.witness) {
        console.error("[noir-proof] Result structure:", Object.keys(result));
        throw new Error("Noir execute returned result without witness property");
      }
      
      witness = result.witness;
      console.log("[noir-proof] Witness generated successfully");
      console.log("[noir-proof] Witness type:", typeof witness, "isArray:", Array.isArray(witness));
    } catch (witnessError: any) {
      console.error("[noir-proof] Witness generation failed:", {
        message: witnessError?.message,
        stack: witnessError?.stack,
        name: witnessError?.name,
        toString: String(witnessError),
        cause: witnessError?.cause
      });
      
      // Try to extract more information from the error
      let errorMsg = witnessError?.message ?? String(witnessError);
      if (errorMsg.includes("unwrap_throw") || errorMsg.includes("Result")) {
        errorMsg = `Circuit execution failed. This usually means:
1. The circuit inputs don't match the expected format
2. The circuit compilation is out of sync with the source code
3. There's an issue with the Noir initialization

Please ensure:
- pixels is an array of exactly 48 BigInt values
- expected_hash is a single BigInt value
- The circuit has been compiled with: cd src/lib/plonk && nargo compile

Original error: ${errorMsg}`;
      }
      
      throw new Error(`Failed to generate witness: ${errorMsg}`);
    }

    // 3) Instanciar backend moderno UltraHonk
    console.log("[noir-proof] Step 3: Getting backend instance...");
    const backend = await getBackendInstance();
    console.log("[noir-proof] Backend instance created");

    // 4) Generar prueba
    console.log("[noir-proof] Step 4: Generating proof...");
    let proof;
    try {
      proof = await backend.generateProof(witness);
      console.log("[noir-proof] Proof generated successfully");
    } catch (proofError: any) {
      console.error("[noir-proof] Proof generation failed:", {
        message: proofError?.message,
        stack: proofError?.stack,
        name: proofError?.name
      });
      throw new Error(`Failed to generate proof: ${proofError?.message ?? String(proofError)}`);
    }

    // 5) Verificar localmente (sanity check fuerte)
    console.log("[noir-proof] Step 5: Verifying proof locally...");
    let ok;
    try {
      ok = await backend.verifyProof(proof);
      console.log("[noir-proof] Local verification result:", ok);
    } catch (verifyError: any) {
      console.error("[noir-proof] Local verification failed:", {
        message: verifyError?.message,
        stack: verifyError?.stack
      });
      throw new Error(`Failed to verify proof locally: ${verifyError?.message ?? String(verifyError)}`);
    }

    if (!ok) {
      throw new Error("Generated proof does NOT verify locally — something is wrong");
    }

    // 6) Serializar de forma JSON-safe
    //    - proof.proof: Uint8Array → base64
    //    - publicInputs: bigint[] → string[]
    console.log("[noir-proof] Step 6: Serializing proof...");
    const proofBytesBase64 = Buffer.from(proof.proof).toString("base64");
    const publicInputs = (proof.publicInputs as unknown as bigint[]).map((input) =>
      input.toString()
    );
    console.log("[noir-proof] Proof serialized, publicInputs count:", publicInputs.length);

    return {
      proofBytesBase64,
      publicInputs
    };
  } catch (error: any) {
    console.error("[noir-proof] Error in generateNoirProof:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      cause: error?.cause
    });
    throw error;
  }
}

/* ----------------------------------------------------------
   VERIFY PROOF (on server)
---------------------------------------------------------- */

export async function verifyNoirProof(
  proofBytesBase64: string,
  publicInputsStrings: string[]
) {
  const backend = await getBackendInstance();

  // 1) Deserializar bytes
  const proofBytes = Buffer.from(proofBytesBase64, "base64");

  // 2) Deserializar Public Inputs
  const publicInputs = publicInputsStrings.map((p) => BigInt(p));

  // 3) Reconstruir objeto en el formato EXACTO que espera bb.js
  const proof = {
    proof: proofBytes,        // Uint8Array
    publicInputs              // bigint[]
  } as any;

  // 4) Verificar
  const ok = await backend.verifyProof(proof);
  return ok;
}
