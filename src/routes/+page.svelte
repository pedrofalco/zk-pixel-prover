<script lang="ts">
    import { onMount } from 'svelte';
    import Button from '$lib/components/Button.svelte';
    import ErrorAlert from '$lib/components/ErrorAlert.svelte';
    import ProofResultCard from '$lib/components/ProofResultCard.svelte';
    import VerificationResultCard from '$lib/components/VerificationResultCard.svelte';
    import { pixelToColor } from '$lib/utils/image';
    import { scrollToElement } from '$lib/utils/scroll';
    import { generateProof, verifyProof } from '$lib/utils/api';
    import type { ProofResult, VerificationResult } from '$lib/utils/api';
    
    let loading = false;
    let error: string | null = null;
    let result: ProofResult | null = null;
    let verificationResult: VerificationResult | null = null;
    let imageData: { pixels: number[]; hash: string } | null = null;
    
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

    async function handleGenerateProof() {
        loading = true;
        error = null;
        result = null;
        verificationResult = null;

        try {
            result = await generateProof();
            console.log('Proof generated:', result);
            scrollToElement(resultElement);
        } catch (err) {
            error = err instanceof Error ? err.message : 'An error occurred';
            console.error('Error:', err);
            scrollToElement(errorElement);
        } finally {
            loading = false;
        }
    }

    async function handleVerifyProof() {
        if (!result) {
            error = 'No proof to verify';
            return;
        }

        loading = true;
        error = null;
        verificationResult = null;

        try {
            verificationResult = await verifyProof(result.proof, result.publicSignals);
            scrollToElement(verificationElement);
        } catch (err) {
            error = err instanceof Error ? err.message : 'An error occurred';
            console.error('Error:', err);
            scrollToElement(errorElement);
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
                
                <!-- {#if imageData}
                    <div class="flex flex-col items-center gap-4 my-6">
                        <div class="text-sm font-semibold">Processed Image (4x4 pixels, RGB color) - <span class="text-red-600">BLURRED</span></div>
                        <div class="grid grid-cols-4 gap-1 border-2 border-gray-400 p-2 bg-gray-100 rounded blur-sm relative">
                            {#each Array(16) as _, i}
                                {@const baseIndex = i * 3}
                                {@const r = imageData.pixels[baseIndex]}
                                {@const g = imageData.pixels[baseIndex + 1]}
                                {@const b = imageData.pixels[baseIndex + 2]}
                                <div 
                                    class="w-12 h-12 border border-gray-300"
                                    style="background-color: {pixelToColor(imageData.pixels, i)}"
                                ></div>
                            {/each}
                            <div class="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                                <span class="text-white font-bold text-lg">🔒 Hidden</span>
                            </div>
                        </div>
                        <div class="text-xs text-gray-600 font-mono break-all">
                            Public Hash: {imageData.hash}
                        </div>
                        <p class="text-xs text-gray-500 italic">
                            The actual pixel values are private and never revealed in the proof
                        </p>
                    </div>
                {/if} -->
            </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
                variant="primary"
                {loading}
                on:click={handleGenerateProof}
            >
                {#if loading}
                    Generating proof...
                {:else}
                    Generate ZK Proof
                {/if}
            </Button>
            <Button 
                variant="secondary"
                {loading}
                disabled={!result}
                on:click={handleVerifyProof}
                title="Verifies the proof mathematically without needing the pixel values"
            >
                {#if loading}
                    Verifying...
                {:else}
                    Verify Proof
                {/if}
            </Button>
        </div>
    </div>

    <ErrorAlert bind:error bind:element={errorElement} />

    {#if result}
        <ProofResultCard {result} bind:element={resultElement} />
    {/if}

    {#if verificationResult}
        <VerificationResultCard {verificationResult} bind:element={verificationElement} />
    {/if}
</div>
