<script lang="ts">
    import { tick } from 'svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import ProofResultCard from '$lib/components/ProofResultCard.svelte';
    import ImageUpload from '$lib/components/ui/ImageUpload.svelte';
    import PageHeader from '$lib/components/PageHeader.svelte';
    import InfoCard from '$lib/components/ui/InfoCard.svelte';
    import ContentCard from '$lib/components/ui/ContentCard.svelte';
    import ProcessedImageDisplay from '$lib/components/ProcessedImageDisplay.svelte';
    import ReferenceImageDownload from '$lib/components/ReferenceImageDownload.svelte';
    import ProofSystemToggle from '$lib/components/ProofSystemToggle.svelte';
    import ProofSystemInfo from '$lib/components/ui/ProofSystemInfo.svelte';
    import { scrollToElement } from '$lib/utils/scroll';
    import { downloadProof } from '$lib/utils/download';
    import { handleGenerateProof } from '$lib/utils/groth16-proof';
    import { handleGeneratePlonkProof } from '$lib/utils/plonk-proof';
    import type { ProofResult } from '$lib/utils/groth16-api';
    import type { PlonkProofResult } from '$lib/utils/plonk-api';
    
    let proofSystem: 'groth16' | 'plonk' = 'plonk';
    let generatingProof = false;
    let error: string | null = null;
    let result: ProofResult | PlonkProofResult | null = null;
    let imageData: { pixels: number[]; hash: string } | null = null;
    
    let resultElement: HTMLElement;
    let errorElement: HTMLElement;

    function handleImageProcessed(pixels: number[], hash: string) {
        imageData = { pixels, hash };
        result = null;
        error = null;
    }

    function handleSystemChange(system: 'groth16' | 'plonk') {
        proofSystem = system;
        result = null;
        error = null;
    }

    async function onGenerateProof() {
        if (!imageData) {
            error = 'Please upload an image first';
            scrollToElement(errorElement);
            return;
        }

        if (proofSystem === 'groth16') {
            await handleGenerateProof(
                imageData.pixels,
                imageData.hash,
                (loading) => { generatingProof = loading; },
                async (err) => { 
                    error = err; 
                    await tick();
                    scrollToElement(errorElement); 
                },
                async (res) => { 
                    result = res; 
                    await tick(); // Wait for DOM to update
                    scrollToElement(resultElement); 
                }
            );
        } else {
            const normalizedHash = imageData.hash.startsWith('0x')
                ? BigInt(imageData.hash).toString()
                : imageData.hash;

            await handleGeneratePlonkProof(
                imageData.pixels,
                normalizedHash,
                (loading) => { generatingProof = loading; },
                async (err) => { 
                    error = err; 
                    await tick();
                    scrollToElement(errorElement); 
                },
                async (res) => { 
                    result = res; 
                    await tick(); // Wait for DOM to update
                    scrollToElement(resultElement); 
                }
            );
        }
    }

</script>

<div class="min-h-screen flex flex-col items-center justify-center p-4 text-black font-mono">
    <PageHeader 
        title="Generate Zero-Knowledge Proof"
        description="Prove you know a specific image <strong>without revealing its pixels</strong>."
    />

    <div class="w-full max-w-4xl mb-6">
        <ContentCard>
            <div class="space-y-4 leading-relaxed">
                <ProofSystemToggle system={proofSystem} onSystemChange={handleSystemChange} />
                
                <ProofSystemInfo system={proofSystem} context="generate" />
                
                <p>
                    Generate a <strong>cryptographic proof</strong> that proves you know an image's pixels without revealing them. 
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
                    Generating {proofSystem === 'groth16' ? 'Groth16' : 'PLONK'} proof...
                {:else}
                    Generate {proofSystem === 'groth16' ? 'Groth16' : 'PLONK'} Proof
                {/if}
            </Button>
        </div>
    </div>

    <ErrorAlert bind:error bind:element={errorElement} />

    {#if result}
        <ProofResultCard {result} bind:element={resultElement} onDownload={() => downloadProof(result, proofSystem)} />
    {/if}
</div>

