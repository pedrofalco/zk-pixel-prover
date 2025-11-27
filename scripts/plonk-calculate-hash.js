import { buildPoseidon } from 'circomlibjs';
import * as fs from 'fs';
import { join } from 'path';

async function calculateHashAndGenerateProverToml() {
    try {
        // Read pixels from the temporary file
        const pixelsPath = join(process.cwd(), 'plonk', 'pixels.json');
        
        if (!fs.existsSync(pixelsPath)) {
            throw new Error('pixels.json not found. Please run plonk-process-image.js first.');
        }
        
        const data = JSON.parse(fs.readFileSync(pixelsPath, 'utf-8'));
        const pixels = data.pixels;
        
        if (!pixels || !Array.isArray(pixels) || pixels.length !== 48) {
            throw new Error('Invalid pixels data. Expected array of 48 values.');
        }
        
        console.log('🔐 Calculating hash with Poseidon...');
        
        // Calculate hash using Poseidon (matching the circuit structure)
        const poseidon = await buildPoseidon();
        
        const hash1 = poseidon(pixels.slice(0, 12));
        const hash2 = poseidon(pixels.slice(12, 24));
        const hash3 = poseidon(pixels.slice(24, 36));
        const hash4 = poseidon(pixels.slice(36, 48));
        const finalHash = poseidon([hash1, hash2, hash3, hash4]);
        const hashString = poseidon.F.toString(finalHash);
        
        console.log('✅ Calculated hash:', hashString);

        // Generate Prover.toml content
        const proverToml = `expected_hash = "${hashString}"
pixels = [${pixels.join(', ')}]`;

        // Write to plonk/Prover.toml
        const proverTomlPath = join(process.cwd(), 'plonk', 'Prover.toml');
        fs.writeFileSync(proverTomlPath, proverToml);
        
        console.log('\n✅ Generated Prover.toml at:', proverTomlPath);
        console.log('\n📝 Prover.toml content:');
        console.log(proverToml);
        console.log('\n✨ You can now run:');
        console.log('   cd plonk');
        console.log('   nargo execute');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

calculateHashAndGenerateProverToml().catch(console.error);

