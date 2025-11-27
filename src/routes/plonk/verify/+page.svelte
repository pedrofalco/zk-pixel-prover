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
    import { handleVerifyPlonkProof } from '$lib/utils/plonk-proof';
    import type { PlonkVerificationResult } from '$lib/utils/plonk-api';
    
    let verifyingProof = false;
    let error: string | null = null;
    let verificationResult: PlonkVerificationResult | null = null;
    let proofData: any = null;
    
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
        if (!proofData) {
            error = 'Please upload a proof file first';
            scrollToElement(errorElement);
            return;
        }

        const publicSignals = Array.isArray(proofData.publicSignals)
            ? proofData.publicSignals
            : [proofData.publicSignals];

        await handleVerifyPlonkProof(
            proofData.proof,
            publicSignals,
            (loading) => { verifyingProof = loading; },
            (err) => { error = err; scrollToElement(errorElement); },
            (res) => { verificationResult = res; scrollToElement(verificationElement); }
        );
    }
</script>

<div class="min-h-screen flex flex-col items-center justify-center px-4 py-8 text-black font-mono">
    <PageHeader 
        title="Verify PLONK Zero-Knowledge Proof"
        description="Upload a PLONK proof file to verify if it matches the <strong>reference image</strong>."
    />

    <div class="w-full max-w-4xl mb-6">
        <ContentCard>
            <div class="space-y-4 leading-relaxed">
                <p>
                    Upload a <code class="bg-black/20 px-2 py-1 rounded">plonk-proof.json</code> file to verify 
                    if it corresponds to the reference image (<strong>sample_4x4.jpeg</strong>).
                </p>
                <InfoCard variant="blue">
                    <strong>🔷 PLONK Verification:</strong> This page verifies proofs generated with <strong>Noir + PLONK (Barretenberg)</strong>. 
                    The verification uses the PLONK proving system instead of Groth16. 
                    For Groth16 proofs, use <a href="/verify" class="underline font-semibold">/verify</a>.
                </InfoCard>
                <InfoCard variant="blue">
                    <strong>🔍 How it works:</strong> The verification checks if the proof was generated 
                    for the reference image without revealing any pixel values. Only the hash is compared.
                </InfoCard>
                
                <div class="flex flex-col items-center gap-4 my-6">
                    <FileUpload 
                        accept=".json,application/json"
                        label="Upload a plonk-proof.json file"
                        onFileSelected={onFileSelected}
                    />

                    {#if proofData}
                        <div class="mt-4 p-4 bg-green-50 border border-green-200 rounded-xs">
                            <p class="text-sm text-green-800 font-semibold">✓ PLONK proof file loaded successfully</p>
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
                title="Verifies if the PLONK proof matches the reference image (sample_4x4.jpeg)"
            >
                {#if verifyingProof}
                    Verifying PLONK proof...
                {:else}
                    Verify PLONK Proof
                {/if}
            </Button>
        </div>
    </div>

    <ErrorAlert bind:error bind:element={errorElement} />

    {#if verificationResult}
        <VerificationResultCard 
            verificationResult={{
                isValid: verificationResult.isValid,
                message: verificationResult.message
            }} 
            bind:element={verificationElement} 
        />
    {/if}
</div>

