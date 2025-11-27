import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		// Exclude packages that need WASM files from optimization
		exclude: ['@aztec/bb.js', '@noir-lang/noir_js']
	},
	ssr: {
		// Key: make these packages external so they use node_modules in runtime
		// This avoids bundling issues and lets them find WASM files in their own structure
		external: ['@aztec/bb.js', '@noir-lang/noir_js', '@noir-lang/noirc_abi', '@noir-lang/acvm_js']
	}
});
