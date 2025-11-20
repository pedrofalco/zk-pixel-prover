# Zero Knowledge Proof System with SvelteKit

A zero-knowledge proof implementation using Circom, SnarkJS, and SvelteKit.

## Project Structure

```
src/
└── lib/
    └── circuits/
        ├── circuit.circom          # Circuit definition
        ├── compiled/               # Compiled circuit files
        │   ├── circuit.r1cs        # R1cs constraint system
        │   ├── circuit.sym         # Debug symbols
        │   ├── circuit.wasm        # WebAssembly executable
        │   └── circuit_js/         # JavaScript wrapper
        ├── proving_keys/           # Cryptographic keys
        │   ├── circuit_0000.zkey   # Proving key
        │   └── verification_key.json # Verification key
        └── trusted_setup/          # Trusted setup files
            └── powersOfTau28_hez_final_12.ptau  # Powers of Tau file
```

## Understanding the Components

### Circuit Files
- **circuit.circom**: The source code for your zero-knowledge circuit written in Circom language
- **circuit.r1cs**: The mathematical representation of your circuit's constraints
- **circuit.sym**: Debug file mapping circuit signals to human-readable names
- **circuit.wasm**: WebAssembly executable used for proof generation
- **circuit_js/**: JavaScript files that provide a wrapper for the WASM code

### Cryptographic Keys
- **circuit_0000.zkey**: The proving key used to generate proofs
- **verification_key.json**: Public key used to verify proofs

### Trusted Setup
- **powersOfTau28_hez_final_12.ptau**: A pre-computed structured reference string used in the trusted setup phase
  - Contains cryptographic parameters for up to 2^28 constraints
  - One-time setup that can be reused for multiple circuits
  - Required for generating circuit-specific keys

### Compiled Circuit Files (`/compiled`)

1. **circuit.wasm** (WebAssembly Binary)
   - The compiled, executable version of your circuit
   - Used during proof generation to compute witnesses
   - Contains the actual computation logic in WebAssembly format
   - Called by snarkjs when generating proofs

2. **generate_witness.js**
   - JavaScript helper file to generate witness data
   - Provides functions to calculate circuit outputs from inputs
   - Works together with circuit.wasm
   - Used in the witness generation phase before proof creation

3. **witness_calculator.js**
   - Core logic for witness calculation
   - Handles the low-level interaction with the WebAssembly module
   - Provides methods to compute witnesses efficiently
   - Used internally by generate_witness.js

4. **circuit.r1cs** (Rank-1 Constraint System)
   - Mathematical representation of your circuit's constraints
   - Contains the algebraic equations that define your circuit
   - Used during the proving key generation
   - Essential for creating zero-knowledge proofs
   - Think of it as the "rules" your proof must satisfy

5. **circuit.sym** (Symbol File)
   - Debug file that maps circuit signals to human-readable names
   - Helps in debugging circuit constraints
   - Contains variable names and their assignments
   - Not used in production, only for development

### The Compilation Process Flow:
```
circuit.circom (Source)
       ↓
1. circuit.r1cs (Constraints)
       ↓
2. circuit.sym (Debug info)
       ↓
3. circuit.wasm (Executable)
       ↓
4. generate_witness.js + witness_calculator.js (JS helpers)
```

When you run a proof generation:
1. Your inputs are processed by `generate_witness.js`
2. `witness_calculator.js` uses `circuit.wasm` to compute the witness
3. The witness and `circuit.r1cs` are used to generate the proof
4. The `.sym` file is available if you need to debug the process

## API Endpoints

### POST /api/proof
Generates a zero-knowledge proof for the circuit.

```typescript
// Request: POST /api/proof
// Response:
{
  "success": true,
  "data": {
    "proof": {...},
    "publicSignals": [...]
  }
}
```

### POST /api/verify
Verifies a previously generated proof.

```typescript
// Request: POST /api/verify
// Body: { proof: {...}, publicSignals: [...] }
// Response:
{
  "success": true,
  "data": {
    "isValid": boolean,
    "message": string
  }
}
```

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Download the Powers of Tau file:
```bash
curl -O https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau
```

3. Compile the circuit:
```bash
circom src/lib/circuits/circuit.circom --r1cs --wasm --sym -o src/lib/circuits/compiled
```

4. Generate the proving key:
```bash
snarkjs groth16 setup src/lib/circuits/compiled/circuit.r1cs src/lib/circuits/trusted_setup/powersOfTau28_hez_final_12.ptau src/lib/circuits/keys/circuit_0000.zkey
```

5. Export the verification key:
```bash
snarkjs zkey export verificationkey src/lib/circuits/keys/circuit_0000.zkey src/lib/circuits/keys/verification_key.json
```

## Development

Start the development server:
```bash
npm run dev
```

## Building for Production

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Understanding Zero-Knowledge Proofs

This project implements a zero-knowledge proof system where:

1. A prover can demonstrate knowledge of a secret without revealing it
2. The proof is generated using the circuit.wasm and proving key
3. Anyone can verify the proof using the verification key
4. The Powers of Tau ceremony ensures the security of the setup

### The Proof Generation Process
1. Circuit defines the rules and constraints
2. Prover inputs their secret values
3. System generates a proof using the proving key
4. Proof can be verified without knowing the secret

### The Verification Process
1. Verifier receives the proof and public signals
2. Uses verification key to check proof validity
3. Gets yes/no answer without learning the secret

## TODO / Future Improvements

- [ ] **Protection against replay attacks**: Add nonce/timestamp to proofs to make them unique and non-reusable
- [ ] **Hash privacy**: Implement commitment schemes to hide the hash until verification, preventing identification of the image being verified
- [ ] **Support for larger images**: Increase resolution from 4x4 to 8x8 or 16x16 pixels for more practical use cases

## Security Considerations

- Keep the proving key secure
- The verification key can be public
- The Powers of Tau file ensures trusted setup
- Circuit compilation must be done in a secure environment

## Resources

- [Circom Documentation](https://docs.circom.io/)
- [SnarkJS Documentation](https://github.com/iden3/snarkjs)
- [Zero Knowledge Proofs Overview](https://zkp.science/)
