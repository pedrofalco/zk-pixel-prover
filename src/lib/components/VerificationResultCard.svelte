<script lang="ts">
    export let verificationResult: { isValid: boolean; message: string };
    export let element: HTMLElement | null = null;
</script>

<div bind:this={element} class="w-full max-w-4xl bg-white/15 backdrop-blur-lg rounded-xs p-6 mb-4 border border-white/20 shadow">
    <div class="flex items-start gap-3 mb-3">
        <div class="text-3xl">
            {verificationResult.isValid ? '✅' : '❌'}
        </div>
        <div class="flex-1">
            <h3 class="text-xl font-bold mb-1">
                {verificationResult.isValid ? 'Valid Proof' : 'Invalid Proof'}
            </h3>
            <p class="text-sm text-gray-700">{verificationResult.message}</p>
        </div>
    </div>
    
    {#if verificationResult.isValid}
        <div class="text-xs text-gray-700 bg-green-900/10 border border-green-500/30 p-3 rounded-xs">
            <strong>✓ Verified:</strong> This proof was generated for the reference image (sample_4x4.jpeg). No pixel values were revealed during verification.
        </div>
    {:else}
        <div class="text-xs text-gray-400 bg-red-900/20 border border-red-500/30 p-3 rounded-xs">
            <strong>✗ Not verified:</strong> This proof does not match the reference image (sample_4x4.jpeg).
        </div>
    {/if}
</div>

