# Migration Plan: Server → Client (Web3/Privacy-First)

## Objective
Migrate the application from a server-centralized model (web2) to a client-private model (web3), where:
- The server does NOT see the user's image
- The server does NOT see the pixels
- The server does NOT see the hash
- All processing and proof generation happens on the client
- The server only serves static code

---

## Current State (Web2)

### What runs on the server:
1. **Image processing** (`/api/process-image`)
   - Receives image from user
   - Uses `sharp` to resize to 4x4
   - Extracts RGB pixels (48 values)
   - **Problem**: The server sees the image and pixels

2. **Hash calculation** (`/api/calculate-hash`)
   - Calculates Poseidon hash of pixels
   - **Problem**: The server sees the pixels

3. **Proof generation** (`/api/plonk/proof`)
   - Generates proof using `plonk-backend.ts`
   - **Problem**: The server sees the pixels and hash

4. **Verification** (`/api/plonk/verify`)
   - Verifies proofs
   - **OK**: Can stay on server (educational) or be moved as well

---

## Migration Plan

### Phase 1: Move Image Processing to Client

#### 1.1 Install dependencies for client-side processing
```bash
npm install browser-image-resizer
# Or use native browser Canvas API
```

#### 1.2 Create client-side processing utility
**File**: `src/lib/utils/image-processing-client.ts`
- Use Canvas API to resize image to 4x4
- Extract RGB pixels directly in the browser
- Don't send anything to the server

#### 1.3 Update `image-processing.ts`
- Change `processImageFile()` to process on client
- Remove calls to `/api/process-image`
- Remove calls to `/api/calculate-hash`

#### 1.4 Remove server endpoints
- `src/routes/api/process-image/+server.ts` → **DELETE**
- `src/routes/api/calculate-hash/+server.ts` → **DELETE** (if exists)

#### 1.5 Testing
- Verify processing works on client
- Verify pixels are correct
- Verify hash is calculated correctly

---

### Phase 2: Move Proof Generation to Client

#### 2.1 Install client dependencies
```bash
npm install buffer vite-plugin-node-polyfills@0.17.0
```

#### 2.2 Configure Vite for client
**File**: `vite.config.ts`
- Add `vite-plugin-node-polyfills`
- Configure polyfills for `Buffer`, `global`, `process`
- Configure `optimizeDeps` to exclude `@aztec/bb.js`
- Configure `resolve.alias` for `pino`

#### 2.3 Create client version of `plonk-backend.ts`
**File**: `src/lib/utils/plonk-backend-client.ts`
- Copy logic from `plonk-backend.ts`
- Adapt for WASM initialization in browser:
  ```typescript
  import initNoirC from '@noir-lang/noirc_abi';
  import initACVM from '@noir-lang/acvm_js';
  import acvm from '@noir-lang/acvm_js/web/acvm_js_bg.wasm?url';
  import noirc from '@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm?url';
  
  // Initialize WASM
  await Promise.all([initACVM(fetch(acvm)), initNoirC(fetch(noirc))]);
  ```
- Use `Barretenberg.new()` before creating `UltraHonkBackend`
- Load circuit from static path or direct import

#### 2.4 Update API calls
**File**: `src/lib/utils/plonk-api.ts`
- Change `generatePlonkProof()` to use `plonk-backend-client.ts`
- Remove call to `/api/plonk/proof`
- Generate proof directly on client

#### 2.5 Update components
**File**: `src/routes/generate/+page.svelte`
- Update to use client functions
- Remove API endpoint calls

#### 2.6 Remove server endpoint
- `src/routes/api/plonk/proof/+server.ts` → **DELETE**

#### 2.7 Testing
- Verify proof is generated on client
- Verify proof is valid
- Verify it can be downloaded

---

### Phase 3: Update Configuration and Dependencies

#### 3.1 Update `vite.config.ts`
```typescript
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    sveltekit(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  optimizeDeps: {
    exclude: ['@aztec/bb.js', '@noir-lang/noir_js']
  },
  resolve: {
    alias: {
      pino: 'pino/browser.js',
    },
  },
  ssr: {
    // No longer need external for client
    // But keep for server verification (optional)
  }
});
```

#### 3.2 Update `package.json`
- Add `buffer` and `vite-plugin-node-polyfills@0.17.0`
- Keep `@aztec/bb.js` and `@noir-lang/noir_js` (now for client)
- Remove `sharp` (no longer used on server)

#### 3.3 Update `netlify.toml` (if applicable)
- No longer need to include WASM files in serverless functions
- Code runs on client

---

### Phase 4: Verification (Optional - Can Stay on Server)

#### Option A: Move verification to client as well
- Create `plonk-verify-client.ts`
- Update `plonk-api.ts` to verify on client
- Remove `/api/plonk/verify`

#### Option B: Keep verification on server (Recommended)
- Useful for demonstration/education
- Doesn't affect privacy (proof is already generated)
- User can verify locally or on server

---

### Phase 5: Cleanup and Optimization

#### 5.1 Remove unused code
- Remove `src/routes/api/process-image/+server.ts`
- Remove `src/routes/api/calculate-hash/+server.ts` (if exists)
- Remove `src/routes/api/plonk/proof/+server.ts`
- Remove `src/lib/utils/plonk-backend.ts` (replaced by client version)
- Remove `sharp` from dependencies

#### 5.2 Optimize bundle
- Check bundle size
- Consider code splitting for WASM modules
- Lazy load circuits if possible

#### 5.3 Update documentation
- Update README.md with new architecture
- Document that everything runs on client
- Update setup instructions

---

## Technical Considerations

### Bundle Size
- **Problem**: WASM files are large (~MB)
- **Solution**: 
  - Code splitting
  - Lazy loading
  - Consider CDN for WASM files

### Performance
- **Problem**: Generating proofs on client can be slow
- **Solution**:
  - Show loading states
  - Consider Web Workers to avoid blocking UI
  - Optimize WASM initialization

### Browser Compatibility
- **Problem**: WASM and polyfills may not work in older browsers
- **Solution**:
  - Detect WASM support
  - Show friendly error message
  - Consider fallback

### Compiled Circuit
- **Problem**: Need to load `plonk.json` on client
- **Solution**:
  - Direct import: `import circuit from '$lib/circuits/plonk/plonk.json'`
  - Or load from static path
  - Consider compression

---

## Migration Checklist

### Phase 1: Image Processing
- [ ] Install dependencies for client-side processing
- [ ] Create `image-processing-client.ts`
- [ ] Update `image-processing.ts`
- [ ] Remove `/api/process-image`
- [ ] Remove `/api/calculate-hash`
- [ ] Testing

### Phase 2: Proof Generation
- [ ] Install `buffer` and `vite-plugin-node-polyfills`
- [ ] Configure Vite
- [ ] Create `plonk-backend-client.ts`
- [ ] Update `plonk-api.ts`
- [ ] Update components
- [ ] Remove `/api/plonk/proof`
- [ ] Testing

### Phase 3: Configuration
- [ ] Update `vite.config.ts`
- [ ] Update `package.json`
- [ ] Update `netlify.toml`
- [ ] Testing

### Phase 4: Verification (Optional)
- [ ] Decide: move or keep on server
- [ ] If move: create `plonk-verify-client.ts`
- [ ] If keep: document why

### Phase 5: Cleanup
- [ ] Remove unused code
- [ ] Optimize bundle
- [ ] Update documentation
- [ ] Final testing

---

## References

- [NoirJS Tutorial (Browser)](https://noir-lang.org/docs/tutorials/noirjs_app)
- Current code in `src/lib/utils/plonk-backend.ts`
- README.md - Current project documentation

---

## Notes

- This migration converts the app from web2 to web3
- The server no longer processes private data
- Users have full control over their data
- Compatible with Aztec/web3 privacy philosophy
