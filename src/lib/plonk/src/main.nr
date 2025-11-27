// Image Attestation Circuit
// Uses the official Noir Poseidon library (compatible with Circom's Poseidon)
use dep::poseidon::poseidon::bn254;

fn main(
    // Private input: array of 48 RGB values
    pixels: [Field; 48],
    // Public input: pre-calculated hash of the image
    expected_hash: pub Field
) -> pub Field {
    // Poseidon has a limit on input size, so we hash in groups of 12 values (4 pixels each)
    // This matches the Circom circuit structure exactly
    
    // Hash first group: pixels[0..12]
    let group1 = [
        pixels[0], pixels[1], pixels[2], pixels[3],
        pixels[4], pixels[5], pixels[6], pixels[7],
        pixels[8], pixels[9], pixels[10], pixels[11]
    ];
    let hash1 = bn254::hash_12(group1);
    
    // Hash second group: pixels[12..24]
    let group2 = [
        pixels[12], pixels[13], pixels[14], pixels[15],
        pixels[16], pixels[17], pixels[18], pixels[19],
        pixels[20], pixels[21], pixels[22], pixels[23]
    ];
    let hash2 = bn254::hash_12(group2);
    
    // Hash third group: pixels[24..36]
    let group3 = [
        pixels[24], pixels[25], pixels[26], pixels[27],
        pixels[28], pixels[29], pixels[30], pixels[31],
        pixels[32], pixels[33], pixels[34], pixels[35]
    ];
    let hash3 = bn254::hash_12(group3);
    
    // Hash fourth group: pixels[36..48]
    let group4 = [
        pixels[36], pixels[37], pixels[38], pixels[39],
        pixels[40], pixels[41], pixels[42], pixels[43],
        pixels[44], pixels[45], pixels[46], pixels[47]
    ];
    let hash4 = bn254::hash_12(group4);
    
    // Combine the four hashes into a final hash
    let intermediate_hashes: [Field; 4] = [hash1, hash2, hash3, hash4];
    let computed_hash = bn254::hash_4(intermediate_hashes);
    
    // Verify that the calculated hash matches the provided hash
    assert(computed_hash == expected_hash);
    
    // Output the calculated hash (public signal)
    computed_hash
}

