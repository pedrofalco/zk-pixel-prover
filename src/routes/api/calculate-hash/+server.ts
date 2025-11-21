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

