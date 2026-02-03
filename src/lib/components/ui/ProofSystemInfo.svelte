<script lang="ts">
    export let system: 'groth16' | 'plonk';
    export let context: 'generate' | 'verify' = 'generate';
    
    const messages = {
        groth16: {
            generate: "You're generating a proof using Circom + SnarkJS with Groth16 proving system.",
            verify: "Verifying a proof generated with Circom + SnarkJS (Groth16)."
        },
        plonk: {
            generate: "You're generating a proof using Noir + Barretenberg with PLONK proving system.",
            verify: "Verifying a proof generated with Noir + Barretenberg (PLONK)."
        }
    };
</script>

{#if system === 'groth16'}
    <div class="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-xs">
        <p class="text-sm text-blue-900">
            <strong>🔷 Groth16:</strong> {messages.groth16[context]}
        </p>
    </div>
{:else}
    <div class="p-4 bg-purple-50 border-l-4 border-purple-500 rounded-xs">
        <p class="text-sm text-purple-900">
            <strong>🔶 PLONK:</strong> {messages.plonk[context]}
        </p>
    </div>
{/if}

