<script lang="ts">
    let loading = false;
    let error: string | null = null;
    let result: { proof: any; publicSignals: any } | null = null;
    let verificationResult: { isValid: boolean; message: string } | null = null;

    async function generateProof() {
        loading = true;
        error = null;
        result = null;
        verificationResult = null;

        try {
            const response = await fetch('/api/proof', {
                method: 'POST'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate proof');
            }

            const data = await response.json();
            result = data.data;
            console.log('Proof generated:', result);
        } catch (err) {
            error = err instanceof Error ? err.message : 'An error occurred';
            console.error('Error:', err);
        } finally {
            loading = false;
        }
    }

    async function verifyProof() {
        if (!result) {
            error = 'No proof to verify';
            return;
        }

        loading = true;
        error = null;
        verificationResult = null;

        try {
            const response = await fetch('/api/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    proof: result.proof,
                    publicSignals: result.publicSignals
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to verify proof');
            }

            const data = await response.json();
            verificationResult = data.data;
        } catch (err) {
            error = err instanceof Error ? err.message : 'An error occurred';
            console.error('Error:', err);
        } finally {
            loading = false;
        }
    }
</script>

<div class="container">
    <div class="buttons">
        <button 
            on:click={generateProof} 
            disabled={loading}
        >
            {loading ? 'Generating...' : 'Generate Proof'}
        </button>

        <button 
            on:click={verifyProof} 
            disabled={loading || !result}
        >
            {loading ? 'Verifying...' : 'Verify Proof'}
        </button>
    </div>

    {#if error}
        <div class="error">
            {error}
        </div>
    {/if}

    {#if result}
        <div class="result">
            <h3>Proof Generated:</h3>
            <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
    {/if}

    {#if verificationResult}
        <div class="verification" class:valid={verificationResult.isValid}>
            <h3>Verification Result:</h3>
            <p>{verificationResult.message}</p>
        </div>
    {/if}
</div>

<style>
    .container {
        margin: 20px;
    }

    .buttons {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
    }

    .error {
        color: red;
        margin-top: 10px;
    }

    .result, .verification {
        margin-top: 20px;
    }

    .verification {
        padding: 10px;
        border-radius: 4px;
        background: #ffebee;
    }

    .verification.valid {
        background: #e8f5e9;
    }

    pre {
        background: #f4f4f4;
        padding: 10px;
        border-radius: 4px;
        overflow-x: auto;
    }

    button {
        padding: 8px 16px;
        cursor: pointer;
    }

    button:disabled {
        cursor: not-allowed;
        opacity: 0.7;
    }
</style>
