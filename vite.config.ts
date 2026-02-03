import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
	plugins: [
		nodePolyfills({
			globals: {
				Buffer: true,
				process: true,
			},
			include: ['buffer']
		}),
		sveltekit()
	],
	optimizeDeps: {
		// Exclude packages that need WASM files from optimization
		exclude: ['@aztec/bb.js', '@noir-lang/noir_js']
	},
	define: {
		// Polyfill global and process for browser
		global: 'globalThis',
		'process.env': '{}',
	},
	resolve: {
		alias: {
			pino: 'pino/browser.js',
			// Polyfill Buffer using the buffer package
			buffer: 'buffer',
		},
	},
	ssr: {
		// Key: make these packages external so they use node_modules in runtime
		// This avoids bundling issues and lets them find WASM files in their own structure
		external: ['@aztec/bb.js', '@noir-lang/noir_js', '@noir-lang/noirc_abi', '@noir-lang/acvm_js']
	}
});
