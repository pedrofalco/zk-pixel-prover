import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export default defineConfig({
	plugins: [
		sveltekit(),
		{
			name: 'copy-bb-wasm',
			writeBundle() {
				// Copy WASM files from @aztec/bb.js to static for production
				// This ensures they're available in Netlify
				const bbPath = join('node_modules', '@aztec', 'bb.js', 'dest', 'node', 'barretenberg_wasm');
				const wasmFiles = [
					'barretenberg-threads.wasm.gz'
				];
				
				wasmFiles.forEach(file => {
					const src = join(bbPath, file);
					const dest = join('static', 'bb-wasm', file);
					
					if (existsSync(src)) {
						mkdirSync(join('static', 'bb-wasm'), { recursive: true });
						copyFileSync(src, dest);
						console.log(`✅ Copied ${file} to static/bb-wasm/`);
					} else {
						console.warn(`⚠️  WASM file not found: ${src}`);
					}
				});
				
				// Also copy to .netlify/server directory if it exists (for serverless functions)
				const netlifyServerPath = join('.netlify', 'server');
				if (existsSync(netlifyServerPath)) {
					wasmFiles.forEach(file => {
						const src = join(bbPath, file);
						const dest = join(netlifyServerPath, 'barretenberg_wasm', file);
						
						if (existsSync(src)) {
							mkdirSync(join(netlifyServerPath, 'barretenberg_wasm'), { recursive: true });
							copyFileSync(src, dest);
							console.log(`✅ Copied ${file} to .netlify/server/barretenberg_wasm/`);
						}
					});
				}
			}
		}
	],
	ssr: {
		// Don't externalize @aztec/bb.js so WASM files are bundled
		noExternal: ['@aztec/bb.js', '@noir-lang/noir_js']
	},
	optimizeDeps: {
		// Include @aztec/bb.js in optimization
		include: ['@aztec/bb.js', '@noir-lang/noir_js']
	}
});
