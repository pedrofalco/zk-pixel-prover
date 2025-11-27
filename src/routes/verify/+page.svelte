<script lang="ts">
    import Button from '$lib/components/ui/Button.svelte';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import VerificationResultCard from '$lib/components/VerificationResultCard.svelte';
    import FileUpload from '$lib/components/ui/FileUpload.svelte';
    import PageHeader from '$lib/components/PageHeader.svelte';
    import InfoCard from '$lib/components/ui/InfoCard.svelte';
    import ContentCard from '$lib/components/ui/ContentCard.svelte';
    import ProofSystemToggle from '$lib/components/ProofSystemToggle.svelte';
    import { scrollToElement } from '$lib/utils/scroll';
    import { loadProofFile } from '$lib/utils/file';
    import { handleVerifyProof } from '$lib/utils/groth16-proof';
    import { handleVerifyPlonkProof } from '$lib/utils/plonk-proof';
    import type { VerificationResult } from '$lib/utils/groth16-api';
    import type { PlonkVerificationResult } from '$lib/utils/plonk-api';
    
    let proofSystem: 'groth16' | 'plonk' = 'groth16';
    let verifyingProof = false;
    let error: string | null = null;
    let verificationResult: VerificationResult | PlonkVerificationResult | null = null;
    let proofData: any = null;
    
    let verificationElement: HTMLElement;
    let errorElement: HTMLElement;

    function handleSystemChange(system: 'groth16' | 'plonk') {
        proofSystem = system;
        proofData = null;
        verificationResult = null;
        error = null;
    }

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

        if (proofSystem === 'groth16') {
            await handleVerifyProof(
                proofData?.proof,
                proofData?.publicSignals,
                (loading) => { verifyingProof = loading; },
                (err) => { error = err; scrollToElement(errorElement); },
                (res) => { verificationResult = res; scrollToElement(verificationElement); }
            );
        } else {
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
    }
</script>

<div class="min-h-screen flex flex-col items-center justify-center p-4 text-black font-mono">
    <PageHeader 
        title="Verify Zero-Knowledge Proof"
        description="Upload a proof file to verify if it matches the <strong>reference image</strong>."
    />

    <div class="w-full max-w-4xl mb-6">
        <ContentCard>
            <div class="space-y-4 leading-relaxed">
                <ProofSystemToggle system={proofSystem} onSystemChange={handleSystemChange} />
                
                {#if proofSystem === 'groth16'}
                    <div class="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-xs">
                        <p class="text-sm text-blue-900">
                            <strong>🔷 Groth16 Mode:</strong> Verifying a proof generated with Circom + SnarkJS (Groth16).
                        </p>
                    </div>
                {:else}
                    <div class="p-3 bg-purple-50 border-l-4 border-purple-500 rounded-xs">
                        <p class="text-sm text-purple-900">
                            <strong>🔶 PLONK Mode:</strong> Verifying a proof generated with Noir + Barretenberg (PLONK).
                        </p>
                    </div>
                {/if}
                
                <p>
                    Upload a <code class="bg-black/20 px-2 py-1 rounded">{proofSystem === 'groth16' ? 'proof.json' : 'plonk-proof.json'}</code> file to verify 
                    if it corresponds to the reference image (<strong>sample_4x4.jpeg</strong>).
                </p>
                
                <InfoCard variant="blue">
                    <strong>🔍 How it works:</strong> The verification checks if the proof was generated 
                    for the reference image without revealing any pixel values. Only the hash is compared.
                </InfoCard>
                
                <div class="flex flex-col items-center gap-4 my-6">
                    <FileUpload 
                        accept=".json,application/json"
                        label={`Upload a ${proofSystem === 'groth16' ? 'proof.json' : 'plonk-proof.json'} file`}
                        onFileSelected={onFileSelected}
                    />

                    {#if proofData}
                        <div class="mt-4 p-4 bg-green-50 border border-green-200 rounded-xs">
                            <p class="text-sm text-green-800 font-semibold">✓ {proofSystem === 'groth16' ? 'Groth16' : 'PLONK'} proof file loaded successfully</p>
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
                title="Verifies if the proof matches the reference image (sample_4x4.jpeg)"
            >
                {#if verifyingProof}
                    Verifying {proofSystem === 'groth16' ? 'Groth16' : 'PLONK'} proof...
                {:else}
                    Verify {proofSystem === 'groth16' ? 'Groth16' : 'PLONK'} Proof
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
