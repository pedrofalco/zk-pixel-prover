<script lang="ts">
    export let verificationResult: { isValid: boolean; message: string };
    export let element: HTMLElement | null = null;
</script>

<div bind:this={element} class="w-full max-w-4xl bg-white/15 backdrop-blur-lg rounded-xs p-6 mb-4 border border-white/20 shadow">
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

