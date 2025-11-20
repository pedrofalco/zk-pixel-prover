<script lang="ts">
    import { onMount } from 'svelte';
    import { Copy, Check } from 'lucide-svelte';
    
    let loading = false;
    let error: string | null = null;
    let result: { proof: any; publicSignals: any } | null = null;
    let verificationResult: { isValid: boolean; message: string } | null = null;
    let imageData: { pixels: number[]; hash: string } | null = null;
    let copied = false;
    
    let resultElement: HTMLElement;
    let verificationElement: HTMLElement;
    let errorElement: HTMLElement;

    onMount(async () => {
        try {
            const response = await fetch('/input.json');
            if (response.ok) {
                imageData = await response.json();
            }
        } catch (err) {
            console.error('Failed to load image data:', err);
        }
    });

    function pixelToColor(pixels: number[], index: number): string {
        // pixels is a flat array: [R1, G1, B1, R2, G2, B2, ..., R16, G16, B16]
        // index is the pixel index (0-15)
        const baseIndex = index * 3;
        const r = pixels[baseIndex];
        const g = pixels[baseIndex + 1];
        const b = pixels[baseIndex + 2];
        return `rgb(${r}, ${g}, ${b})`;
    }

    async function copyToClipboard(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            copied = true;
            setTimeout(() => {
                copied = false;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }

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
            
            // Scroll to result after a brief delay to ensure DOM is updated
            setTimeout(() => {
                if (resultElement) {
                    resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        } catch (err) {
            error = err instanceof Error ? err.message : 'An error occurred';
            console.error('Error:', err);
            
            // Scroll to error
            setTimeout(() => {
                if (errorElement) {
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
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
            
            // Scroll to verification result after a brief delay
            setTimeout(() => {
                if (verificationElement) {
                    verificationElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        } catch (err) {
            error = err instanceof Error ? err.message : 'An error occurred';
            console.error('Error:', err);
            
            // Scroll to error
            setTimeout(() => {
                if (errorElement) {
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-screen flex flex-col items-center justify-center px-4 py-8 text-black font-mono">
    <div class="text-center mb-8 max-w-3xl">
        <h1 class="text-xl md:text-3xl font-extrabold mb-4 drop-shadow-lg">
            Zero-Knowledge Image Proof
        </h1>
        <p class="opacity-95 leading-relaxed">
            Prove you know a specific image <strong>without revealing its pixels</strong>.
        </p>
    </div>

    <div class="w-full max-w-4xl mb-6">
        <div class="bg-white/15 backdrop-blur-lg rounded p-8 mb-6 border border-white/20 shadow">
            <div class="space-y-4 leading-relaxed">
                <p>
                    We have a processed 4x4 pixel image. You can generate a <strong>cryptographic proof</strong> 
                    that demonstrates you know exactly those pixels, but without showing them.
                </p>
                <p class="bg-blue-50 p-3 rounded border-l-4 border-blue-500 text-sm">
                    <strong>💡 The Power:</strong> You can say <em>"I know which image this is, but I don't need to show you the image"</em> 
                    and prove it cryptographically. The proof is verifiable without revealing any pixel values.
                </p>
                
                <!-- <div class="bg-white/20 p-4 rounded-xl border-l-4 border-yellow-400 font-medium">
                    Only the image hash is revealed, never the original pixels.
                </div> -->
            </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
                class="p-4 font-semibold rounded-sm bg-blue-700 text-white shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 min-w-[200px] justify-center"
                on:click={generateProof} 
                disabled={loading}
            >
                {#if loading}
                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating proof...
                {:else}
                    Generate ZK Proof
                {/if}
            </button>

            <button 
                class="p-4 font-semibold rounded-sm bg-green-700 text-white shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 min-w-[200px] justify-center"
                on:click={verifyProof} 
                disabled={loading || !result}
                title="Verifies the proof mathematically without needing the pixel values"
            >
                {#if loading}
                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                {:else}
                    Verify Proof
                {/if}
            </button>
        </div>
    </div>

    {#if error}
        <div bind:this={errorElement} class="w-full max-w-4xl bg-red-500/20 backdrop-blur-lg rounded p-4 mb-4 flex items-center gap-3 border border-red-400/40">
            <span class="text-2xl">⚠️</span>
            <span>{error}</span>
        </div>
    {/if}

    {#if result}
        <div bind:this={resultElement} class="w-full max-w-4xl bg-white/15 backdrop-blur-lg rounded p-8 mb-4 border border-white/20 shadow">
            <h3 class="text-2xl font-bold mb-2">Proof Generated</h3>
            <p class="mb-4 opacity-90">
                A ZK proof was created that demonstrates knowledge of the image without revealing the pixels.
            </p>
            <p class="text-sm text-gray-400 mb-4">
                The proof contains cryptographic evidence that you know the pixel values, but the pixels themselves are never revealed.
            </p>
            <details class="mt-4">
                <summary class="cursor-pointer p-3 bg-white/10 rounded mb-2 font-medium hover:bg-white/20 transition-colors">
                    View technical details
                </summary>
                <div class="relative mt-2">
                    <button
                        on:click={() => copyToClipboard(JSON.stringify(result, null, 2))}
                        class="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-white"
                        title="Copy to clipboard"
                    >
                        {#if copied}
                            <Check size={16} />
                        {:else}
                            <Copy size={16} />
                        {/if}
                    </button>
                    <pre class="bg-black/80 p-4 pr-12 rounded overflow-x-auto text-sm text-gray-200">{JSON.stringify(result, null, 2)}</pre>
                </div>
            </details>
        </div>
    {/if}

    {#if verificationResult}
        <div bind:this={verificationElement} class="w-full max-w-4xl bg-white/15 backdrop-blur-lg rounded p-6 mb-4 border border-white/20 shadow">
            <div class="flex items-center gap-4 mb-3">
                <div class="text-4xl">
                    {verificationResult.isValid ? '✅' : '❌'}
                </div>
                <div>
                    <h3 class="text-xl font-bold mb-1">
                        {verificationResult.isValid ? 'Proof Valid' : 'Proof Invalid'}
                    </h3>
                    <p class="opacity-90">{verificationResult.message}</p>
                </div>
            </div>
            <div class="text-sm text-gray-400 border-t border-white/20 pt-3 mt-3">
                <strong>How it works:</strong> Verification checks the proof mathematically using only the public hash and verification key. 
                No pixel values are needed or revealed during verification.
            </div>
        </div>
    {/if}
</div>
