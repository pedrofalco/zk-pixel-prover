<script lang="ts">
    import Button from '$lib/components/Button.svelte';
    import ErrorAlert from '$lib/components/ErrorAlert.svelte';
    import ProofResultCard from '$lib/components/ProofResultCard.svelte';
    import ImageUpload from '$lib/components/ImageUpload.svelte';
    import PageHeader from '$lib/components/PageHeader.svelte';
    import InfoCard from '$lib/components/InfoCard.svelte';
    import ContentCard from '$lib/components/ContentCard.svelte';
    import ProcessedImageDisplay from '$lib/components/ProcessedImageDisplay.svelte';
    import ReferenceImageDownload from '$lib/components/ReferenceImageDownload.svelte';
    import { scrollToElement } from '$lib/utils/scroll';
    import { downloadJSON } from '$lib/utils/download';
    import { handleGeneratePlonkProof } from '$lib/utils/plonk-proof';
    import type { PlonkProofResult } from '$lib/utils/plonk-api';
    
    let generatingProof = false;
    let error: string | null = null;
    let result: PlonkProofResult | null = null;
    let imageData: { pixels: number[]; hash: string } | null = null;
    
    let resultElement: HTMLElement;
    let errorElement: HTMLElement;

    function handleImageProcessed(pixels: number[], hash: string) {
        imageData = { pixels, hash };
        result = null;
        error = null;
    }

    async function onGenerateProof() {
        if (!imageData) {
            error = 'Please upload an image first';
            scrollToElement(errorElement);
            return;
        }

        const normalizedHash = imageData.hash.startsWith('0x')
            ? BigInt(imageData.hash).toString()
            : imageData.hash;

        await handleGeneratePlonkProof(
            imageData.pixels,
            normalizedHash,
            (loading) => { generatingProof = loading; },
            (err) => { error = err; scrollToElement(errorElement); },
            (res) => { result = res; scrollToElement(resultElement); }
        );
    }

    function downloadProof() {
        if (!result) return;
        // Convert PlonkProofResult to format compatible with ProofResultCard
        downloadJSON(result, 'plonk-proof.json');
    }
</script>

<div class="min-h-screen flex flex-col items-center justify-center px-4 py-8 text-black font-mono">
    <PageHeader 
        title="Zero-Knowledge Pixel Proof (PLONK)"
        description="Prove you know a specific image <strong>without revealing its pixels</strong> using <strong>Noir + PLONK</strong>."
    />

    <div class="w-full max-w-4xl mb-6">
        <ContentCard>
            <div class="space-y-4 leading-relaxed">
                <p>
                    Generate a <strong>cryptographic proof</strong> using <strong>Noir + PLONK (Barretenberg)</strong> that proves you know an image's pixels without revealing them. 
                    Upload any image, <ReferenceImageDownload 
                        imagePath="/sample_4x4.jpeg"
                        filename="sample_4x4.jpeg"
                        errorMessage="Failed to download reference image"
                        text="download the reference image"
                        title="Download the reference image to test the system"
                    />, or <ReferenceImageDownload 
                        imagePath="/sample_4x4_fake.jpeg"
                        filename="sample_4x4_fake.jpeg"
                        errorMessage="Failed to download fake image"
                        text="download a fake image"
                        title="Download a fake image to test verification"
                    /> to test verification.
                </p>
                <InfoCard variant="blue">
                    <strong>🔷 PLONK vs Groth16:</strong> This page uses <strong>Noir + PLONK</strong> (Barretenberg) instead of Circom + Groth16. 
                    PLONK is a universal SNARK that doesn't require a trusted setup per circuit. 
                    The main page uses <a href="/" class="underline font-semibold">Circom + Groth16</a>.
                </InfoCard>
                <InfoCard variant="blue">
                    <strong>💡 The Power:</strong> Generate proofs for any image and download them. 
                    Then go to <a href="/plonk/verify" class="underline font-semibold">/plonk/verify</a> to check if a PLONK proof 
                    matches the <strong>reference image</strong> (sample_4x4.jpeg) without revealing any pixel values.
                </InfoCard>
                
                <div class="flex flex-col items-center gap-4 my-6">
                    <ImageUpload 
                        onImageProcessed={handleImageProcessed}
                    />
                    
                    {#if imageData}
                        <ProcessedImageDisplay 
                            pixels={imageData.pixels} 
                            hash={imageData.hash} 
                        />
                    {/if}
                </div>
            </div>
        </ContentCard>

        <div class="flex justify-center">
            <Button 
                variant="primary"
                loading={generatingProof}
                disabled={!imageData}
                onclick={onGenerateProof}
            >
                {#if generatingProof}
                    Generating PLONK proof...
                {:else}
                    Generate PLONK Proof
                {/if}
            </Button>
        </div>
    </div>

    <ErrorAlert bind:error bind:element={errorElement} />

    {#if result}
        <ProofResultCard 
            {result}
            bind:element={resultElement} 
            onDownload={downloadProof} 
        />
    {/if}
</div>

