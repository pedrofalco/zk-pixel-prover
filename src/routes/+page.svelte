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
    import { handleGenerateProof } from '$lib/utils/proof';
    import type { ProofResult } from '$lib/utils/api';
    
    let generatingProof = false;
    let error: string | null = null;
    let result: ProofResult | null = null;
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

        await handleGenerateProof(
            imageData.pixels,
            imageData.hash,
            (loading) => { generatingProof = loading; },
            (err) => { error = err; scrollToElement(errorElement); },
            (res) => { result = res; scrollToElement(resultElement); }
        );
    }

    function downloadProof() {
        if (!result) return;
        downloadJSON(result, 'proof.json');
    }
</script>

<div class="min-h-screen flex flex-col items-center justify-center px-4 py-8 text-black font-mono">
    <PageHeader 
        title="Zero-Knowledge Image Proof"
        description="Prove you know a specific image <strong>without revealing its pixels</strong>."
    />

    <div class="w-full max-w-4xl mb-6">
        <ContentCard>
            <div class="space-y-4 leading-relaxed">
                <p>
                    Upload any image to generate a <strong>cryptographic proof</strong> 
                    that demonstrates you know exactly those pixels, but without showing them. 
                    Or <ReferenceImageDownload />
                </p>
                <InfoCard variant="blue">
                    <strong>💡 The Power:</strong> Generate proofs for any image and download them. 
                    Then go to <a href="/verify" class="underline font-semibold">/verify</a> to check if a proof 
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
                    Generating proof...
                {:else}
                    Generate ZK Proof
                {/if}
            </Button>
        </div>
    </div>

    <ErrorAlert bind:error bind:element={errorElement} />

    {#if result}
        <ProofResultCard {result} bind:element={resultElement} onDownload={downloadProof} />
    {/if}
</div>
