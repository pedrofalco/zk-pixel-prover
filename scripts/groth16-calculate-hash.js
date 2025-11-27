import { buildPoseidon } from 'circomlibjs';
import * as fs from 'fs';

async function calculateHash() {
    const poseidon = await buildPoseidon();
    const input = JSON.parse(fs.readFileSync('static/input.json', 'utf-8'));
    const pixels = input.pixels;
    
    // Hash in groups of 12 (matching the circuit)
    const hash1 = poseidon(pixels.slice(0, 12));
    const hash2 = poseidon(pixels.slice(12, 24));
    const hash3 = poseidon(pixels.slice(24, 36));
    const hash4 = poseidon(pixels.slice(36, 48));
    
    // Final hash
    const finalHash = poseidon([hash1, hash2, hash3, hash4]);
    const hashString = poseidon.F.toString(finalHash);
    
    console.log('Calculated hash:', hashString);
    
    // Update input.json with the hash
    input.hash = hashString;
    fs.writeFileSync('static/input.json', JSON.stringify(input, null, 2));
    console.log('Updated input.json with hash');
}

calculateHash().catch(console.error);
