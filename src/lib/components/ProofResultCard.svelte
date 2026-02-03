<script lang="ts">
    import CodeBlock from './ui/CodeBlock.svelte';
    
    export let result: Record<string, any>;
    export let element: HTMLElement | null = null;
    export let onDownload: (() => void) | null = null;
</script>

<div bind:this={element} class="w-full max-w-4xl bg-white/15 backdrop-blur-lg rounded-xs p-4 md:p-6 mb-4 border border-white/20 md:shadow">
    <div class="flex items-start gap-3 mb-4">
        <div class="text-3xl">✅</div>
        <div class="flex-1">
            <h3 class="text-xl font-bold mb-1">Proof Generated Successfully</h3>
            <p class="text-sm text-gray-700">
                Your zero-knowledge proof has been created. Download it to verify later.
            </p>
        </div>
    </div>
    
    {#if onDownload}
        <button
            onclick={onDownload}
            class="w-full mb-3 px-4 py-3 bg-green-600/80 hover:bg-green-700 text-white rounded-xs font-semibold transition-colors flex items-center justify-center gap-2"
        >
            <span>💾</span>
            Download Proof File
        </button>
    {/if}
    
    <div class="text-xs text-gray-700 bg-white/5 p-3 rounded-xs mb-3">
        <strong>Next step:</strong> Use the downloaded file in the <a href="/verify" class="underline font-bold">/verify</a> page to check if it matches the reference image.
    </div>
    
    <details class="mt-2">
        <summary class="cursor-pointer p-2 bg-white/5 rounded-xs text-xs font-medium hover:bg-white/10 transition-colors">
            View technical details
        </summary>
        <div class="mt-2">
            <CodeBlock code={JSON.stringify(result, null, 2)} />
        </div>
    </details>
</div>

