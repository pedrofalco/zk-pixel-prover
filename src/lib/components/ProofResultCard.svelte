<script lang="ts">
    import CodeBlock from './CodeBlock.svelte';
    
    export let result: { proof: any; publicSignals: any };
    export let element: HTMLElement | null = null;
</script>

<div bind:this={element} class="w-full max-w-4xl bg-white/15 backdrop-blur-lg rounded p-8 mb-4 border border-white/20 shadow">
    <h3 class="text-2xl font-bold mb-2">Proof Generated</h3>
    <p class="mb-4 opacity-90">
        A ZK proof was created that demonstrates knowledge of the image without revealing the pixels.
    </p>
    <p class="text-sm text-gray-400 mb-4">
        The proof contains cryptographic evidence that you know the pixel values, but the pixels themselves are never revealed.
    </p>
    <details class="mt-4">
        <summary class="cursor-pointer p-3 bg-white/10 rounded mb-2 font-medium hover:bg-white/20 transition-colors">
            View technical details
        </summary>
        <div class="mt-2">
            <CodeBlock code={JSON.stringify(result, null, 2)} />
        </div>
    </details>
</div>

