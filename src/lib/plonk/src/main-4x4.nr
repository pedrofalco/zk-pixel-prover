// Image Attestation Circuit - 8x8 pixels (test size)
// Uses the official Noir Poseidon library (compatible with Circom's Poseidon)
use dep::poseidon::poseidon::bn254;

fn main(
    // Private input: array of 192 RGB values (8x8 pixels x 3 channels)
    pixels: [Field; 192],
    // Public input: pre-calculated hash of the image
    expected_hash: pub Field
) -> pub Field {
    // Poseidon has a limit on input size (12 values max), so we hash in groups
    // 8x8 = 64 pixels x 3 channels = 192 values
    // 192 / 12 = 16 groups of 12 values each
    
    // Level 1: Hash pixels in groups of 12 (16 groups)
    let group1 = [
        pixels[0], pixels[1], pixels[2], pixels[3],
        pixels[4], pixels[5], pixels[6], pixels[7],
        pixels[8], pixels[9], pixels[10], pixels[11]
    ];
    let hash1 = bn254::hash_12(group1);
    
    let group2 = [
        pixels[12], pixels[13], pixels[14], pixels[15],
        pixels[16], pixels[17], pixels[18], pixels[19],
        pixels[20], pixels[21], pixels[22], pixels[23]
    ];
    let hash2 = bn254::hash_12(group2);
    
    let group3 = [
        pixels[24], pixels[25], pixels[26], pixels[27],
        pixels[28], pixels[29], pixels[30], pixels[31],
        pixels[32], pixels[33], pixels[34], pixels[35]
    ];
    let hash3 = bn254::hash_12(group3);
    
    let group4 = [
        pixels[36], pixels[37], pixels[38], pixels[39],
        pixels[40], pixels[41], pixels[42], pixels[43],
        pixels[44], pixels[45], pixels[46], pixels[47]
    ];
    let hash4 = bn254::hash_12(group4);
    
    let group5 = [
        pixels[48], pixels[49], pixels[50], pixels[51],
        pixels[52], pixels[53], pixels[54], pixels[55],
        pixels[56], pixels[57], pixels[58], pixels[59]
    ];
    let hash5 = bn254::hash_12(group5);
    
    let group6 = [
        pixels[60], pixels[61], pixels[62], pixels[63],
        pixels[64], pixels[65], pixels[66], pixels[67],
        pixels[68], pixels[69], pixels[70], pixels[71]
    ];
    let hash6 = bn254::hash_12(group6);
    
    let group7 = [
        pixels[72], pixels[73], pixels[74], pixels[75],
        pixels[76], pixels[77], pixels[78], pixels[79],
        pixels[80], pixels[81], pixels[82], pixels[83]
    ];
    let hash7 = bn254::hash_12(group7);
    
    let group8 = [
        pixels[84], pixels[85], pixels[86], pixels[87],
        pixels[88], pixels[89], pixels[90], pixels[91],
        pixels[92], pixels[93], pixels[94], pixels[95]
    ];
    let hash8 = bn254::hash_12(group8);
    
    let group9 = [
        pixels[96], pixels[97], pixels[98], pixels[99],
        pixels[100], pixels[101], pixels[102], pixels[103],
        pixels[104], pixels[105], pixels[106], pixels[107]
    ];
    let hash9 = bn254::hash_12(group9);
    
    let group10 = [
        pixels[108], pixels[109], pixels[110], pixels[111],
        pixels[112], pixels[113], pixels[114], pixels[115],
        pixels[116], pixels[117], pixels[118], pixels[119]
    ];
    let hash10 = bn254::hash_12(group10);
    
    let group11 = [
        pixels[120], pixels[121], pixels[122], pixels[123],
        pixels[124], pixels[125], pixels[126], pixels[127],
        pixels[128], pixels[129], pixels[130], pixels[131]
    ];
    let hash11 = bn254::hash_12(group11);
    
    let group12 = [
        pixels[132], pixels[133], pixels[134], pixels[135],
        pixels[136], pixels[137], pixels[138], pixels[139],
        pixels[140], pixels[141], pixels[142], pixels[143]
    ];
    let hash12 = bn254::hash_12(group12);
    
    let group13 = [
        pixels[144], pixels[145], pixels[146], pixels[147],
        pixels[148], pixels[149], pixels[150], pixels[151],
        pixels[152], pixels[153], pixels[154], pixels[155]
    ];
    let hash13 = bn254::hash_12(group13);
    
    let group14 = [
        pixels[156], pixels[157], pixels[158], pixels[159],
        pixels[160], pixels[161], pixels[162], pixels[163],
        pixels[164], pixels[165], pixels[166], pixels[167]
    ];
    let hash14 = bn254::hash_12(group14);
    
    let group15 = [
        pixels[168], pixels[169], pixels[170], pixels[171],
        pixels[172], pixels[173], pixels[174], pixels[175],
        pixels[176], pixels[177], pixels[178], pixels[179]
    ];
    let hash15 = bn254::hash_12(group15);
    
    let group16 = [
        pixels[180], pixels[181], pixels[182], pixels[183],
        pixels[184], pixels[185], pixels[186], pixels[187],
        pixels[188], pixels[189], pixels[190], pixels[191]
    ];
    let hash16 = bn254::hash_12(group16);
    
    // Level 2: Combine 16 hashes into 4 groups of 4
    let level2_group1 = [hash1, hash2, hash3, hash4];
    let level2_hash1 = bn254::hash_4(level2_group1);
    
    let level2_group2 = [hash5, hash6, hash7, hash8];
    let level2_hash2 = bn254::hash_4(level2_group2);
    
    let level2_group3 = [hash9, hash10, hash11, hash12];
    let level2_hash3 = bn254::hash_4(level2_group3);
    
    let level2_group4 = [hash13, hash14, hash15, hash16];
    let level2_hash4 = bn254::hash_4(level2_group4);
    
    // Final: Combine 4 hashes into 1 final hash
    let final_group = [level2_hash1, level2_hash2, level2_hash3, level2_hash4];
    let computed_hash = bn254::hash_4(final_group);
    
    // Verify that the calculated hash matches the provided hash
    assert(computed_hash == expected_hash);
    
    // Output the calculated hash (public signal)
    computed_hash
}
