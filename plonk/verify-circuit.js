import { readFileSync } from 'fs';
import { join } from 'path';

// Verify that the circuit is compiled and accessible
function verifyCircuit() {
  try {
    console.log('🔍 Verifying Noir circuit setup...\n');
    
    // Check if plonk.json exists in target
    const targetPath = join(process.cwd(), 'plonk', 'target', 'plonk.json');
    const staticPath = join(process.cwd(), 'static', 'circuits', 'plonk', 'plonk.json');
    
    let circuitPath = null;
    let circuitJson = null;
    
    try {
      circuitJson = JSON.parse(readFileSync(targetPath, 'utf-8'));
      circuitPath = targetPath;
      console.log('✅ Found circuit in plonk/target/plonk.json');
    } catch (e) {
      try {
        circuitJson = JSON.parse(readFileSync(staticPath, 'utf-8'));
        circuitPath = staticPath;
        console.log('✅ Found circuit in static/circuits/plonk/plonk.json');
      } catch (e2) {
        console.error('❌ Circuit not found in either location!');
        console.error('   Expected:', targetPath);
        console.error('   Or:', staticPath);
        process.exit(1);
      }
    }
    
    console.log('📄 Circuit file size:', JSON.stringify(circuitJson).length, 'characters');
    console.log('📦 Circuit has bytecode:', !!circuitJson.bytecode);
    console.log('📋 Circuit keys:', Object.keys(circuitJson).slice(0, 10).join(', '), '...');
    
    // Check Prover.toml
    const proverPath = join(process.cwd(), 'plonk', 'Prover.toml');
    try {
      const proverContent = readFileSync(proverPath, 'utf-8');
      console.log('\n✅ Prover.toml found');
      
      // Check if it has the expected structure
      if (proverContent.includes('expected_hash') && proverContent.includes('pixels')) {
        console.log('✅ Prover.toml has expected_hash and pixels');
      } else {
        console.log('⚠️  Prover.toml might be missing expected fields');
      }
    } catch (e) {
      console.log('⚠️  Prover.toml not found (this is OK if using web interface)');
    }
    
    console.log('\n✨ Circuit verification complete!');
    console.log('\n💡 If you\'re getting errors, try:');
    console.log('   1. Recompile the circuit: cd plonk && nargo compile');
    console.log('   2. Copy to static: cp plonk/target/plonk.json static/circuits/plonk/');
    console.log('   3. Restart your dev server');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifyCircuit();

