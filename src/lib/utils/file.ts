/**
 * Utility functions for file handling
 */

export async function loadProofFile(file: File): Promise<{ proof: any; publicSignals: any }> {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        throw new Error('Please upload a JSON file');
    }

    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!data.proof || !data.publicSignals) {
        throw new Error('Invalid proof file. Missing proof or publicSignals.');
    }

    return {
        proof: data.proof,
        publicSignals: data.publicSignals
    };
}

