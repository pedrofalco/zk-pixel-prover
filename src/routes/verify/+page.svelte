<script lang="ts">
    import { tick } from 'svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import ErrorAlert from '$lib/components/ui/ErrorAlert.svelte';
    import VerificationResultCard from '$lib/components/VerificationResultCard.svelte';
    import FileUpload from '$lib/components/ui/FileUpload.svelte';
    import PageHeader from '$lib/components/PageHeader.svelte';
    import InfoCard from '$lib/components/ui/InfoCard.svelte';
    import ContentCard from '$lib/components/ui/ContentCard.svelte';
    import ProofSystemToggle from '$lib/components/ProofSystemToggle.svelte';
    import ProofSystemInfo from '$lib/components/ui/ProofSystemInfo.svelte';
    import { scrollToElement } from '$lib/utils/scroll';
    import { loadProofFile } from '$lib/utils/file';
    import { handleVerifyProof } from '$lib/utils/groth16-proof';
    import { handleVerifyPlonkProof } from '$lib/utils/plonk-proof';
    import type { VerificationResult } from '$lib/utils/groth16-api';
    import type { PlonkVerificationResult } from '$lib/utils/plonk-api';
    
    let proofSystem: 'groth16' | 'plonk' = 'plonk';
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
            await tick();
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
                async (err) => { 
                    error = err; 
                    await tick();
                    scrollToElement(errorElement); 
                },
                async (res) => { 
                    verificationResult = res; 
                    await tick(); // Wait for DOM to update
                    scrollToElement(verificationElement); 
                }
            );
        } else {
            const publicSignals = Array.isArray(proofData.publicSignals)
                ? proofData.publicSignals
                : [proofData.publicSignals];

            await handleVerifyPlonkProof(
                proofData.proof,
                publicSignals,
                (loading) => { verifyingProof = loading; },
                async (err) => { 
                    error = err; 
                    await tick();
                    scrollToElement(errorElement); 
                },
                async (res) => { 
                    verificationResult = res; 
                    await tick(); // Wait for DOM to update
                    scrollToElement(verificationElement); 
                }
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
            <div class="space-y-6 leading-relaxed">
                <ProofSystemToggle system={proofSystem} onSystemChange={handleSystemChange} />
                
                <ProofSystemInfo system={proofSystem} context="verify" />
                
                <div class="text-sm text-gray-700 space-y-3">
                    <p><strong>How to use:</strong></p>
                    <ol class="list-decimal list-inside space-y-1 ml-2">
                        <li>Upload a <code class="bg-black/20 px-1.5 py-0.5 rounded text-xs">{proofSystem === 'groth16' ? 'proof.json' : 'plonk-proof.json'}</code> file</li>
                        <li>Click "Verify Proof"</li>
                        <li>Check if it matches the reference image (<strong>sample_4x4.jpeg</strong>)</li>
                    </ol>
                    <p class="text-xs text-gray-600 italic">The verification only compares hashes, pixel values remain private.</p>
                </div>
                
                <div class="flex flex-col items-center gap-4 my-8">
                    <FileUpload 
                        accept=".json,application/json"
                        label={`Upload a ${proofSystem === 'groth16' ? 'proof.json' : 'plonk-proof.json'} file`}
                        onFileSelected={onFileSelected}
                    />

                    {#if proofData}
                        <div class="p-4 bg-green-50 border border-green-200 rounded-xs w-full">
                            <p class="text-base text-green-800 font-semibold text-center">✓ {proofSystem === 'groth16' ? 'Groth16' : 'PLONK'} proof file loaded successfully</p>
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
