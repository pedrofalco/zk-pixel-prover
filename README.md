# Zero-Knowledge Image Attestation

A minimal zero-knowledge proof demo that attests knowledge of private structured data, using images as a concrete stand-in.  
Supports **PLONK (Noir + Barretenberg)** and **Groth16 (Circom + SnarkJS)**.

PLONK proofs are generated client-side. Groth16 proofs are currently generated server-side.

---

## What this is

This project explores how zero-knowledge proofs can be used to prove knowledge of private data **without revealing the data itself**.

A prover generates a ZK proof that a private input matches a public commitment.  
A verifier checks the proof without learning anything about the input.

The private input is represented as a small image (4×4 pixels), but the image itself is incidental.

---

## Why images

Images are used as a simple, intuitive proxy for **private structured data**: high-dimensional, information-rich and sensitive.

In that sense, this maps naturally to domains such as:
**ID documents, biometrics, sensor data, device fingerprints, capture-time attestations**.

The same approach applies to any structured private input.

---

## How it works (high level)

- A 4×4 RGB image (48 values) is flattened
- A Poseidon hash is computed inside the circuit
- The prover generates a ZK proof that the computed hash matches a public reference
- Anyone with the verification key can verify the proof

---

## Scope

This is a **theoretical–practical exploration**, not a production system.

The goal is to explore:
- circuit constraints
- different proving systems
- client-side proving and trust boundaries

The 4×4 resolution is intentional to keep circuits small and reasoning explicit.

---

## Stack

- Noir + Barretenberg (PLONK)
- Circom + SnarkJS (Groth16)
- Poseidon hash
- Svelte frontend

---

## Quick start

### Installation

```bash
npm install
```

### Using the Web Interface

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:5173`

3. Navigate to **Generate** or **Verify**:
   - **Generate**: Upload an image to create a zero-knowledge proof
   - **Verify**: Upload a previously generated proof to verify its validity

4. Toggle between **PLONK** and **Groth16** proof systems using the switch at the top

### Generating a Proof

1. Go to the **Generate** page
2. Select your proof system (PLONK or Groth16)
3. Upload an image (will be resized to 4x4 pixels)
4. Click "Generate Proof"
5. Download the proof JSON file

### Verifying a Proof

1. Go to the **Verify** page
2. Select the same proof system used to generate the proof
3. Upload the proof JSON file
4. Click "Verify Proof"
5. The system will confirm if the proof is valid and matches the reference image

## Project Architecture

### Directory Structure

```
zk-img/
├── src/
│   ├── lib/
│   │   ├── circuits/          # Groth16 circuit files
│   │   │   ├── circuit.circom
│   │   │   ├── compiled/      # Compiled circuit (WASM, R1CS, etc.)
│   │   │   ├── keys/          # Proving and verification keys
│   │   │   ├── plonk/         # PLONK circuit (ACIR JSON)
│   │   │   └── reference/     # Reference image
│   │   ├── plonk/             # PLONK circuit source
│   │   │   ├── src/
│   │   │   │   └── main.nr    # Noir circuit source
│   │   │   ├── Nargo.toml
│   │   │   └── target/        # Compiled Noir circuit
│   │   ├── components/        # Svelte components
│   │   │   └── ui/           # Reusable UI components
│   │   └── utils/            # Utility functions
│   │       ├── plonk-client.ts         # PLONK client-side proof generation/verification
│   │       ├── image-processing-client.ts  # Client-side image processing and hashing
│   │       ├── image-processing.ts     # Image processing wrapper
│   │       ├── groth16-proof.ts        # Groth16 frontend handlers
│   │       ├── plonk-proof.ts          # PLONK frontend handlers
│   │       ├── legacy/
│   │       │   └── plonk-backend.ts    # Legacy server-side PLONK backend (deprecated)
│   │       └── reference-hash.ts       # Pre-calculated reference hash
│   └── routes/
│       ├── generate/         # Proof generation page
│       ├── verify/           # Proof verification page
│       └── api/
│           ├── plonk/
│           │   └── verify/   # PLONK verification endpoint (legacy)
│           └── proof/        # Groth16 API endpoints
├── scripts/                  # Development scripts
│   ├── process-image.js      # Common image processing
│   ├── plonk-calculate-hash.js
│   ├── groth16-calculate-hash.js
│   └── ...
└── static/                   # Static assets
    └── sample_4x4.jpeg       # Reference image
```

### Data Flow

1. **Image Upload**: User uploads an image via the web interface
2. **Image Processing**: Image is resized to 4x4 pixels, RGB values extracted (48 values) - **client-side**
3. **Hash Calculation**: Poseidon hash is computed from the 48 pixel values - **client-side**
4. **Proof Generation**: Zero-knowledge proof is generated - **client-side** (PLONK) or **server-side** (Groth16)
5. **Proof Download**: User downloads the proof as JSON
6. **Proof Verification**: User uploads proof, system verifies it - **client-side** (PLONK) or **server-side** (Groth16)

## PLONK (Noir + Barretenberg)

PLONK is a universal zero-knowledge proof system implemented using Noir (circuit language) and Barretenberg (proving backend).

### How It Works

1. **Circuit**: Written in Noir (`src/lib/plonk/src/main.nr`)
   - Takes 48 private pixel values and a public expected hash
   - Computes Poseidon hash in groups (4 groups of 12 values, then combine)
   - Verifies the computed hash matches the expected hash

2. **Compilation**: Noir circuit is compiled to ACIR (Abstract Circuit Intermediate Representation)
   - Output: `src/lib/circuits/plonk/plonk.json`

3. **Proof Generation**: **Client-side** using `@aztec/bb.js` (UltraHonk backend)
   - All processing happens in the browser for privacy
   - Generates witness from inputs
   - Creates PLONK proof
   - Returns proof bytes and public inputs

4. **Verification**: **Client-side** using the same backend
   - Verifies proof mathematically in the browser
   - Compares public hash with reference hash
   - No server communication needed

### Important Files

- **`src/lib/plonk/src/main.nr`**: Noir circuit source code
- **`src/lib/plonk/Nargo.toml`**: Noir project configuration
- **`src/lib/circuits/plonk/plonk.json`**: Compiled circuit (ACIR), imported by client-side code
- **`src/lib/utils/plonk-client.ts`**: Client-side PLONK proof generation and verification
- **`src/lib/utils/image-processing-client.ts`**: Client-side image processing and Poseidon hashing
- **`src/lib/utils/plonk-api.ts`**: API layer that dynamically imports client-side code
- **`src/lib/utils/legacy/plonk-backend.ts`**: Legacy server-side backend (deprecated)
- **`src/routes/api/plonk/verify/+server.ts`**: Legacy verification endpoint (for compatibility)

### Setup Instructions

#### Prerequisites

1. **Install Noir (nargo)**:
   ```bash
   # Install noirup (Noir version manager)
   curl -L https://raw.githubusercontent.com/noir-lang/noirup/refs/heads/main/install | bash
   
   # Install Noir
   noirup
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```
   
   This installs the following packages for **client-side** proof operations:
   - `@noir-lang/noir_js@1.0.0-beta.15` - Main interface for loading and executing Noir circuits
   - `@aztec/bb.js@3.0.0-nightly.20251104` - UltraHonk backend for generating/verifying proofs
   - `circomlibjs` - JavaScript library for Poseidon hash calculation
   
   **Version Compatibility**: These versions are compatible and work together as recommended by the [official NoirJS documentation](https://noir-lang.org/docs/tutorials/noirjs_app). The documentation states: "In this guide, we will install versions pinned to 1.0.0-beta.15. These work with Barretenberg version 3.0.0-nightly.20251104, so we are using that one version too."
   
   **Note**: Proof generation now runs **client-side** (in the browser) for maximum privacy. The browser's native APIs (`Canvas`, `btoa`, `atob`) are used for image processing and base64 encoding, eliminating the need for Node.js-specific polyfills like `buffer`.
   
   **Known Compatibility Issues (CLI only)**: 
   
   If you encounter compatibility issues, they are likely related to the CLI tools (`nargo`/`bb`) used for circuit compilation, not the JavaScript libraries. The JS libraries (`@noir-lang/noir_js` and `@aztec/bb.js`) are designed to work together and handle version compatibility internally.
   
   **CLI Version Conflicts (Historical)**:
   - **Problem**: When using CLI tools (`nargo` and `bb`), there were version incompatibility issues
   - **Affected Versions**: 
     - `nargo` 1.0.0-beta.15 with certain `bb` versions
     - Recommended CLI combination was `nargo` 1.0.0-beta.3 with `bb` 0.82.2
   - **Error**: `bb prove` would fail with conversion errors: `Assertion failed: (uint256_t(fr_vec[1]) < ...) Conversion error here usually implies some bad proof serde or parsing`
   - **Root Cause**: Serialization/deserialization incompatibility between `nargo` and `bb` CLI versions
   - **Solution**: Use JavaScript/TypeScript libraries (`@noir-lang/noir_js` and `@aztec/bb.js`) instead of CLI tools for proof generation. The JS libraries handle version compatibility internally and avoid these CLI-specific issues.
   
   **Current Status**: This project uses the JS libraries, so these CLI compatibility issues do not apply. The CLI is only used for circuit compilation (`nargo compile`), not for proof generation.
   
   **Note on CLI vs JS Libraries**: During development, we encountered compatibility issues with the CLI tools (`bb prove`). This led us to use the JavaScript libraries (`@noir-lang/noir_js` and `@aztec/bb.js`) instead, which turned out to be the standard approach for web applications. The CLI (`bb prove`) is primarily used for local development and testing, while JS libraries are the recommended approach for production web apps because they:
   - Integrate seamlessly with web frameworks
   - Handle version compatibility internally
   - Are easier to deploy and maintain
   - Are the officially recommended approach for web applications

#### Compile the Circuit

1. Navigate to the PLONK directory:
   ```bash
   cd src/lib/plonk
   ```

2. Compile the circuit:
   ```bash
   nargo compile
   ```
   This generates `target/plonk.json` (ACIR format).

3. Copy the compiled circuit to the circuits directory:
   ```bash
   cp target/plonk.json ../circuits/plonk/plonk.json
   ```

#### Generate Test Inputs

1. Process an image to extract pixels:
   ```bash
   node scripts/process-image.js static/sample_4x4.jpeg plonk
   ```
   This creates `src/lib/plonk/pixels.json`.

2. Calculate hash and generate `Prover.toml`:
   ```bash
   node scripts/plonk-calculate-hash.js
   ```
   This creates `src/lib/plonk/Prover.toml` with the hash and pixels.

3. (Optional) Test the circuit locally:
   ```bash
   cd src/lib/plonk
   nargo execute
   ```

### Development Scripts

- **`scripts/process-image.js`**: Processes images (resize to 4x4, extract RGB pixels)
  ```bash
  node scripts/process-image.js [image-path] plonk
  ```

- **`scripts/plonk-calculate-hash.js`**: Calculates Poseidon hash and generates `Prover.toml`
  ```bash
  node scripts/plonk-calculate-hash.js
  ```

- **`scripts/plonk-verify-setup.js`**: Verifies PLONK setup (checks for compiled circuit, etc.)
  ```bash
  node scripts/plonk-verify-setup.js
  ```

### How the Client-Side Backend Works

The PLONK client (`src/lib/utils/plonk-client.ts`) handles all operations in the browser:

1. **WASM Initialization**: Initializes Noir and Barretenberg WASM modules in the browser
2. **Circuit Loading**: Imports `plonk.json` from `src/lib/circuits/plonk/`
3. **Noir Instance**: Creates Noir instance with the compiled circuit
4. **Backend Instance**: Creates `UltraHonkBackend` from `@aztec/bb.js`
5. **Witness Generation**: Uses `noir.execute()` to generate witness from inputs
6. **Proof Generation**: Generates PLONK proof entirely in the browser
7. **Proof Verification**: Verifies proof mathematically in the browser

**Privacy Benefits**: All sensitive data (pixels, witness) stays in the browser. Only the proof and public hash are ever exposed.

**Image Processing**: The `image-processing-client.ts` module handles:
- Image resizing using native Canvas API
- RGB pixel extraction
- Poseidon hash calculation using `circomlibjs`
- All processing happens client-side without server communication

## Groth16 (Circom + SnarkJS)

Groth16 is a zero-knowledge proof system implemented using Circom (circuit language) and SnarkJS (JavaScript library).

### How It Works

1. **Circuit**: Written in Circom (`src/lib/circuits/circuit.circom`)
   - Takes 48 private pixel values and a public expected hash
   - Computes Poseidon hash in groups (4 groups of 12 values, then combine)
   - Verifies the computed hash matches the expected hash

2. **Compilation**: Circom circuit is compiled to R1CS, WASM, and other formats
   - `circuit.r1cs`: Rank-1 Constraint System (mathematical constraints)
   - `circuit.wasm`: WebAssembly executable for witness generation
   - `circuit.sym`: Debug symbols

3. **Trusted Setup**: Powers of Tau ceremony generates proving and verification keys
   - `circuit_0000.zkey`: Proving key (used to generate proofs)
   - `verification_key.json`: Verification key (public, used to verify proofs)

4. **Proof Generation**: Server-side using SnarkJS
   - Generates witness using WASM
   - Creates Groth16 proof using proving key
   - Returns proof and public signals

5. **Verification**: Server-side using SnarkJS
   - Verifies proof mathematically
   - Compares public hash with reference hash

### Important Files

- **`src/lib/circuits/circuit.circom`**: Circom circuit source code
- **`src/lib/circuits/compiled/circuit.wasm`**: Compiled WebAssembly for witness generation
- **`src/lib/circuits/compiled/circuit.r1cs`**: Rank-1 Constraint System
- **`src/lib/circuits/keys/circuit_0000.zkey`**: Proving key (keep secure)
- **`src/lib/circuits/keys/verification_key.json`**: Verification key (public)
- **`src/lib/circuits/trusted_setup/powersOfTau28_hez_final_12.ptau`**: Powers of Tau file
- **`src/routes/api/proof/+server.ts`**: API endpoint for proof generation
- **`src/routes/api/verify/+server.ts`**: API endpoint for proof verification

### Setup Instructions

#### Prerequisites

1. **Install Circom**:
   ```bash
   npm install -g circom
   ```

2. **Install SnarkJS**:
   ```bash
   npm install -g snarkjs
   ```

3. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

#### Download Powers of Tau

```bash
curl -O https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau
mv powersOfTau28_hez_final_12.ptau src/lib/circuits/trusted_setup/
```

#### Compile the Circuit

```bash
circom src/lib/circuits/circuit.circom --r1cs --wasm --sym -o src/lib/circuits/compiled
```

This generates:
- `circuit.r1cs`: Constraint system
- `circuit.wasm`: WebAssembly executable
- `circuit.sym`: Debug symbols
- `circuit_js/`: JavaScript wrapper for WASM

#### Generate Proving Key

```bash
snarkjs groth16 setup \
  src/lib/circuits/compiled/circuit.r1cs \
  src/lib/circuits/trusted_setup/powersOfTau28_hez_final_12.ptau \
  src/lib/circuits/keys/circuit_0000.zkey
```

#### Export Verification Key

```bash
snarkjs zkey export verificationkey \
  src/lib/circuits/keys/circuit_0000.zkey \
  src/lib/circuits/keys/verification_key.json
```

### Development Scripts

- **`scripts/process-image.js`**: Processes images (resize to 4x4, extract RGB pixels)
  ```bash
  node scripts/process-image.js [image-path] groth16
  ```

- **`scripts/groth16-calculate-hash.js`**: Calculates Poseidon hash and updates `static/input.json`
  ```bash
  node scripts/groth16-calculate-hash.js
  ```

- **`scripts/groth16-verify-setup.js`**: Verifies Groth16 setup (checks for WASM, keys, etc.)
  ```bash
  node scripts/groth16-verify-setup.js
  ```

### How the Backend Works

The Groth16 backend uses SnarkJS directly in the API endpoints:

1. **Witness Generation**: SnarkJS uses `circuit.wasm` to generate witness from inputs
2. **Proof Generation**: `snarkjs.groth16.fullProve()` generates proof using:
   - Witness (from WASM)
   - Proving key (`circuit_0000.zkey`)
3. **Proof Verification**: `snarkjs.groth16.verify()` verifies proof using:
   - Proof and public signals
   - Verification key (`verification_key.json`)

**Note**: The backend runs **server-side only**. WASM and keys are not sent to the client.

## Development Scripts

All development scripts are located in the `scripts/` directory:

### Common Scripts

- **`process-image.js`**: Unified image processing for both systems
  - Resizes image to 4x4 pixels
  - Extracts RGB values (48 values total)
  - Saves to system-specific output file
  ```bash
  node scripts/process-image.js [image-path] [system]
  # system: 'groth16' or 'plonk'
  ```

### PLONK Scripts

- **`plonk-calculate-hash.js`**: Calculates Poseidon hash and generates `Prover.toml`
  ```bash
  node scripts/plonk-calculate-hash.js
  ```

- **`plonk-verify-setup.js`**: Verifies PLONK setup is complete
  ```bash
  node scripts/plonk-verify-setup.js
  ```

### Groth16 Scripts

- **`groth16-calculate-hash.js`**: Calculates Poseidon hash and updates `static/input.json`
  ```bash
  node scripts/groth16-calculate-hash.js
  ```

- **`groth16-verify-setup.js`**: Verifies Groth16 setup is complete
  ```bash
  node scripts/groth16-verify-setup.js
  ```

## Deployment (Netlify)

This project is configured for deployment on Netlify with serverless functions.

### Configuration

The `netlify.toml` file configures:

1. **Node Bundler**: Uses `esbuild` for bundling
2. **External Node Modules**: `@aztec/bb.js` and `@noir-lang` packages are externalized
3. **Included Files**: WASM files from node_modules are included in the serverless function bundle

### Key Configuration Details

- **WASM Files**: Barretenberg and Noir WASM files are included via `included_files`
- **CRS Path**: Barretenberg CRS is stored in `/tmp/.bb-crs` (writable in Netlify)
- **Circuit Import**: `plonk.json` is directly imported (embedded in server bundle)
- **Reference Hash**: Pre-calculated constant (no runtime image processing)

### Troubleshooting

If you encounter `ENOENT` errors for WASM files:

1. Verify `included_files` in `netlify.toml` includes all necessary WASM paths
2. Check that `ssr.external` in `vite.config.ts` lists the Noir/Aztec packages
3. Ensure `adapter-netlify` is configured in `svelte.config.js`

## Understanding Zero-Knowledge Proofs

### What Are Zero-Knowledge Proofs?

Zero-knowledge proofs allow a prover to demonstrate knowledge of a secret without revealing the secret itself. In this project:

1. **Secret**: The 48 RGB pixel values of an image
2. **Proof**: Cryptographic proof that the image's hash matches a reference hash
3. **Verification**: Anyone can verify the proof without learning the pixel values

### How It Works in This Project

1. **Image Processing**: Image is resized to 4x4 pixels (48 RGB values)
2. **Hash Calculation**: Poseidon hash is computed from the 48 values
3. **Proof Generation**: Zero-knowledge proof is generated that:
   - The prover knows 48 pixel values
   - Those values hash to a specific value (the reference hash)
   - Without revealing the pixel values
4. **Verification**: Verifier checks:
   - The proof is mathematically valid
   - The public hash matches the reference hash

### Why Poseidon Hash?

Poseidon is a hash function designed for zero-knowledge circuits:
- Efficient in ZK circuits (low constraint count)
- Compatible with both Circom and Noir
- Used in many ZK applications (Zcash, Aztec, etc.)

## Use Cases & Practical Applications

### Current Limitations

This prototype processes images at 4x4 pixels, which limits practical applications. However, the concept can be extended to larger images.

### Potential Use Cases

1. **Image-Based Authentication**
   - Prove knowledge of a secret image without revealing it
   - Alternative to password-based authentication
   - Example: "Prove you know the secret image to access this system"

2. **Content Verification (Sensitive Images)**
   - Prove you have access to sensitive/private images without exposing them
   - Useful for confidential content verification
   - Example: Medical images, private documents, classified content

3. **Puzzle/Challenge Systems**
   - Cryptographic puzzles where the solution is an image
   - Prove you solved the puzzle without revealing the solution
   - Example: CTF challenges, treasure hunts, educational games

4. **Access Control**
   - Prove you have a specific image (like a key) without showing it
   - Multi-factor authentication using visual secrets
   - Example: "Prove you have the key image to unlock this feature"

5. **Educational/Demonstration**
   - Clear example of how ZKPs work with visual data
   - Teaching tool for understanding zero-knowledge concepts
   - Foundation for more complex ZKP systems

### Why Not for Regular Images?

For publicly visible images (like NFTs), this approach doesn't make much sense because:
- The image is already public, so hiding it provides no benefit
- NFT ownership is better proven through blockchain signatures
- The value is in the public display, not in hiding it

### When It Makes Sense

This approach is valuable when:
- The **image itself is the secret** (not just proof of ownership)
- You need to **prove knowledge without revealing** the content
- The image is **sensitive/private** and shouldn't be exposed
- You're building **puzzle/challenge systems** where the image is the solution

## Security Considerations

- **Proving Keys**: Keep proving keys secure (especially `circuit_0000.zkey` for Groth16)
- **Verification Keys**: Verification keys can be public
- **Trusted Setup**: Powers of Tau file ensures trusted setup for Groth16
- **Circuit Compilation**: Circuit compilation must be done in a secure environment
- **Reference Hash**: The reference hash is public (it's the "expected" value)

## TODO / Future Improvements

- [ ] **Protection against replay attacks**: Add nonce/timestamp to proofs to make them unique and non-reusable (especially important for blockchain implementations)
- [ ] **Hash privacy**: Implement commitment schemes to hide the hash until verification, preventing identification of the image being verified (critical for blockchain/public ledgers)
- [ ] **Support for larger images**: Increase resolution from 4x4 to 8x8 or 16x16 pixels for more practical use cases

## Resources

- [Noir Documentation](https://noir-lang.org/)
- [Barretenberg (Aztec)](https://github.com/AztecProtocol/aztec-packages)
- [Circom Documentation](https://docs.circom.io/)
- [SnarkJS Documentation](https://github.com/iden3/snarkjs)
- [Zero Knowledge Proofs Overview](https://zkp.science/)
