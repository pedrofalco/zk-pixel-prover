<script lang="ts">
    import Button from '$lib/components/Button.svelte';
    import ErrorAlert from '$lib/components/ErrorAlert.svelte';
    import VerificationResultCard from '$lib/components/VerificationResultCard.svelte';
    import FileUpload from '$lib/components/FileUpload.svelte';
    import PageHeader from '$lib/components/PageHeader.svelte';
    import InfoCard from '$lib/components/InfoCard.svelte';
    import ContentCard from '$lib/components/ContentCard.svelte';
    import { scrollToElement } from '$lib/utils/scroll';
    import { loadProofFile } from '$lib/utils/file';
    import { handleVerifyProof } from '$lib/utils/proof';
    import type { VerificationResult } from '$lib/utils/api';
    
    let verifyingProof = false;
    let error: string | null = null;
    let verificationResult: VerificationResult | null = null;
    let proofData: { proof: any; publicSignals: any } | null = null;
    
    let verificationElement: HTMLElement;
    let errorElement: HTMLElement;

    async function onFileSelected(file: File) {
        try {
            proofData = await loadProofFile(file);
            error = null;
            verificationResult = null;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to load proof file';
            console.error('Error loading proof:', err);
            scrollToElement(errorElement);
        }
    }

    async function onVerifyProof() {
        await handleVerifyProof(
            proofData?.proof,
            proofData?.publicSignals,
            (loading) => { verifyingProof = loading; },
            (err) => { error = err; scrollToElement(errorElement); },
            (res) => { verificationResult = res; scrollToElement(verificationElement); }
        );
    }
</script>

<div class="min-h-screen flex flex-col items-center justify-center px-4 py-8 text-black font-mono">
    <PageHeader 
        title="Verify Zero-Knowledge Proof"
        description="Upload a proof file to verify if it matches the <strong>reference image</strong>."
    />

    <div class="w-full max-w-4xl mb-6">
        <ContentCard>
            <div class="space-y-4 leading-relaxed">
                <p>
                    Upload a <code class="bg-black/20 px-2 py-1 rounded">proof.json</code> file to verify 
                    if it corresponds to the reference image (<strong>manoloide_4x4.jpeg</strong>).
                </p>
                <InfoCard variant="blue">
                    <strong>🔍 How it works:</strong> The verification checks if the proof was generated 
                    for the reference image without revealing any pixel values. Only the hash is compared.
                </InfoCard>
                
                <div class="flex flex-col items-center gap-4 my-6">
                    <FileUpload 
                        accept=".json,application/json"
                        label="Upload a proof.json file"
                        onFileSelected={onFileSelected}
                    />

                    {#if proofData}
                        <div class="mt-4 p-4 bg-green-50 border border-green-200 rounded-xs">
                            <p class="text-sm text-green-800 font-semibold">✓ Proof file loaded successfully</p>
                        </div>
                    {/if}
                </div>
            </div>
        </ContentCard>

        <div class="flex justify-center">
            <Button 
                variant="secondary"
                loading={verifyingProof}
                disabled={!proofData}
                onclick={onVerifyProof}
                title="Verifies if the proof matches the reference image (manoloide_4x4.jpeg)"
            >
                {#if verifyingProof}
                    Verifying...
                {:else}
                    Verify Proof
                {/if}
            </Button>
        </div>
    </div>

    <ErrorAlert bind:error bind:element={errorElement} />

    {#if verificationResult}
        <VerificationResultCard {verificationResult} bind:element={verificationElement} />
    {/if}
</div>
