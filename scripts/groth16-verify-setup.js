import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Resolve circuit file paths (same logic as circuit-paths.ts)
function getCircuitPath(relativePath) {
  const cwd = process.cwd();
  const cleanPath = relativePath.replace(/^circuits\//, '');
  
  // Try static/ first (production)
  const staticPath = join(cwd, 'static', 'circuits', cleanPath);
  if (existsSync(staticPath)) {
    return staticPath;
  }
  
  // Fallback to src/ (development)
  const srcPath = join(cwd, 'src', 'lib', 'circuits', cleanPath);
  if (existsSync(srcPath)) {
    return srcPath;
  }
  
  // Last resort: return static path (will throw error if doesn't exist)
  return staticPath;
}

// Verify that the Groth16 circuit is compiled and accessible
function verifyCircuit() {
  try {
    console.log('🔍 Verifying Groth16 circuit setup...\n');
    
    // Check required files
    const requiredFiles = [
      { path: 'circuits/compiled/circuit_js/circuit.wasm', name: 'circuit.wasm' },
      { path: 'circuits/keys/circuit_0000.zkey', name: 'circuit_0000.zkey' },
      { path: 'circuits/keys/verification_key.json', name: 'verification_key.json' }
    ];
    
    let allFound = true;
    
    for (const file of requiredFiles) {
      try {
        const fullPath = getCircuitPath(file.path);
        if (existsSync(fullPath)) {
          console.log(`✅ Found ${file.name} at: ${fullPath}`);
          
          // Additional checks for specific files
          if (file.name === 'verification_key.json') {
            try {
              const vk = JSON.parse(readFileSync(fullPath, 'utf-8'));
              console.log(`   - Verification key has ${Object.keys(vk).length} properties`);
            } catch (e) {
              console.log(`   ⚠️  Warning: Could not parse verification key JSON`);
            }
          }
        } else {
          console.error(`❌ ${file.name} not found!`);
          console.error(`   Expected at: ${fullPath}`);
          allFound = false;
        }
      } catch (error) {
        console.error(`❌ Error checking ${file.name}:`, error.message);
        allFound = false;
      }
    }
    
    if (!allFound) {
      console.log('\n💡 If files are missing, try:');
      console.log('   1. Compile the circuit:');
      console.log('      circom src/lib/circuits/circuit.circom --r1cs --wasm --sym -o src/lib/circuits/compiled');
      console.log('   2. Generate proving key:');
      console.log('      snarkjs groth16 setup src/lib/circuits/compiled/circuit.r1cs <ptau-file> src/lib/circuits/keys/circuit_0000.zkey');
      console.log('   3. Export verification key:');
      console.log('      snarkjs zkey export verificationkey src/lib/circuits/keys/circuit_0000.zkey src/lib/circuits/keys/verification_key.json');
      console.log('   4. Copy to static for production:');
      console.log('      cp -r src/lib/circuits/compiled static/circuits/');
      console.log('      cp -r src/lib/circuits/keys static/circuits/');
      process.exit(1);
    }
    
    console.log('\n✨ Circuit verification complete!');
    console.log('✅ All required Groth16 files are present and accessible');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

verifyCircuit();

