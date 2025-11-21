pragma circom 2.0.0;

include "../../../node_modules/circomlib/circuits/poseidon.circom";

template ImageAttestation() {
    // Input: array of 48 RGB values (16 pixels × 3 channels)
    // Format: [R1, G1, B1, R2, G2, B2, ..., R16, G16, B16]
    signal input pixels[48];
    // Input: pre-calculated hash of the image
    signal input hash;
    
    // Output: the calculated hash (for verification)
    signal output out;

    // Poseidon has a limit on input size, so we'll hash in groups
    // Hash in groups of 12 values (4 pixels each)
    component poseidon1 = Poseidon(12);
    for (var i = 0; i < 12; i++) {
        poseidon1.inputs[i] <== pixels[i];
    }
    
    component poseidon2 = Poseidon(12);
    for (var i = 0; i < 12; i++) {
        poseidon2.inputs[i] <== pixels[i + 12];
    }
    
    component poseidon3 = Poseidon(12);
    for (var i = 0; i < 12; i++) {
        poseidon3.inputs[i] <== pixels[i + 24];
    }
    
    component poseidon4 = Poseidon(12);
    for (var i = 0; i < 12; i++) {
        poseidon4.inputs[i] <== pixels[i + 36];
    }
    
    // Combine the four hashes into a final hash
    component poseidonFinal = Poseidon(4);
    poseidonFinal.inputs[0] <== poseidon1.out;
    poseidonFinal.inputs[1] <== poseidon2.out;
    poseidonFinal.inputs[2] <== poseidon3.out;
    poseidonFinal.inputs[3] <== poseidon4.out;
    
    // Verify that the calculated hash matches the provided hash
    poseidonFinal.out === hash;
    
    // Output the calculated hash
    out <== poseidonFinal.out;
}

component main = ImageAttestation();
