// Copy WASM files to .netlify/server after build
// @aztec/bb.js looks for WASM files using relative paths from the bundle
// Error shows it's looking for: ../../barretenberg-threads.wasm.gz from chunks/
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const bbPath = join(rootDir, 'node_modules', '@aztec', 'bb.js', 'dest', 'node', 'barretenberg_wasm');
const wasmFiles = ['barretenberg-threads.wasm.gz'];
const netlifyServerPath = join(rootDir, '.netlify', 'server');

if (existsSync(netlifyServerPath)) {
	// Copy to multiple locations where @aztec/bb.js might look
	const locations = [
		// Location 1: Directly in server root (for ../../barretenberg-threads.wasm.gz from chunks/)
		join(netlifyServerPath, 'barretenberg-threads.wasm.gz'),
		// Location 2: In barretenberg_wasm subdirectory
		join(netlifyServerPath, 'barretenberg_wasm', 'barretenberg-threads.wasm.gz'),
		// Location 3: In chunks directory (where the bundle is)
		join(netlifyServerPath, 'chunks', 'barretenberg-threads.wasm.gz')
	];
	
	wasmFiles.forEach(file => {
		const src = join(bbPath, file);
		
		if (!existsSync(src)) {
			console.warn(`⚠️  WASM file not found: ${src}`);
			return;
		}
		
		locations.forEach(dest => {
			const destDir = dirname(dest);
			if (!existsSync(destDir)) {
				mkdirSync(destDir, { recursive: true });
			}
			copyFileSync(src, dest);
			console.log(`✅ Copied ${file} to ${dest.replace(rootDir, '.')}`);
		});
	});
} else {
	console.warn(`⚠️  .netlify/server directory not found, skipping WASM copy`);
}

