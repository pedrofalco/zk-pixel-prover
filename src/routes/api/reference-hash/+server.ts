import { json } from '@sveltejs/kit';
import { REFERENCE_HASH } from '$lib/utils/reference-hash';

/**
 * Returns the pre-calculated reference hash for sample_4x4.jpeg
 * The hash is constant and doesn't need to be recalculated on every request.
 */
export async function GET() {
    return json({
        success: true,
        data: {
            hash: REFERENCE_HASH
        }
    });
}

