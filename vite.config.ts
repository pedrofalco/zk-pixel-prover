import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		// Exclude @aztec/bb.js from optimization
		exclude: ['@aztec/bb.js']
	},
	ssr: {
		// Key: make bb.js external so it uses node_modules in runtime
		// This avoids bundling issues and lets bb.js find WASM files in its own structure
		external: ['@aztec/bb.js']
	}
});
