/**
 * ============================================================================
 * ⚠️  DEPRECATED ENDPOINT - LEGACY CODE ⚠️
 * ============================================================================
 * 
 * This endpoint is DEPRECATED and NO LONGER USED by the application.
 * 
 * **Migration Status**: Hash calculation has been moved to client-side
 * (Phase 1 of migration to web3/privacy-first architecture).
 * 
 * **Why deprecated?**
 * - Privacy: The server should NOT see user pixels or hash
 * - Architecture: Moving to client-side processing aligns with web3 principles
 * - Current implementation: Uses `circomlibjs` directly in the browser
 * 
 * **Current client-side implementation:**
 * - File: `src/lib/utils/image-processing-client.ts`
 * - Function: `calculatePoseidonHash()`
 * - Uses `circomlibjs` (same library, now in browser)
 * - Same algorithm: groups of 12, then combine 4 hashes
 * 
 * **Note on hash calculation:**
 * - Both Groth16 and PLONK use `circomlibjs` to calculate hash BEFORE passing to circuit
 * - PLONK circuit (Noir) VERIFIES the hash internally, but doesn't calculate it
 * - The hash must match between JS (`circomlibjs`) and circuit (Noir's Poseidon)
 * - Both are compatible (see comment in `src/lib/plonk/src/main.nr`)
 * 
 * **This endpoint is kept for:**
 * - Historical reference
 * - Potential rollback if needed
 * - Understanding the migration path
 * 
 * **DO NOT USE** this endpoint in new code.
 * Use `calculatePoseidonHash()` from `image-processing-client.ts` instead.
 * 
 * ============================================================================
 */

import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { buildPoseidon } from 'circomlibjs';

export async function POST({ request }) {
    try {
        const { pixels } = await request.json();

        if (!pixels || !Array.isArray(pixels) || pixels.length !== 48) {
            throw new Error('Invalid pixels array. Expected 48 RGB values.');
        }

        // Calculate hash using Poseidon (matching circuit structure: groups of 12)
        const poseidon = await buildPoseidon();
        
        const hash1 = poseidon(pixels.slice(0, 12));
        const hash2 = poseidon(pixels.slice(12, 24));
        const hash3 = poseidon(pixels.slice(24, 36));
        const hash4 = poseidon(pixels.slice(36, 48));
        const finalHash = poseidon([hash1, hash2, hash3, hash4]);
        const hashString = poseidon.F.toString(finalHash);

        return json({
            success: true,
            data: {
                hash: hashString
            }
        });
    } catch (err) {
        console.error('Hash calculation error:', err);
        throw error(500, err instanceof Error ? err.message : String(err));
    }
}

