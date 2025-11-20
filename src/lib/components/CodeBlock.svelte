<script lang="ts">
    import { Copy, Check } from 'lucide-svelte';
    import { copyToClipboard } from '../utils/clipboard';
    import { writable } from 'svelte/store';
    
    export let code: string;
    
    let copied = writable(false);
    
    async function handleCopy() {
        const success = await copyToClipboard(code);
        if (success) {
            copied.set(true);
            setTimeout(() => {
                copied.set(false);
            }, 2000);
        }
    }
</script>

<div class="relative">
    <button
        on:click={handleCopy}
        class="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-white z-10"
        title="Copy to clipboard"
    >
        {#if $copied}
            <Check size={16} />
        {:else}
            <Copy size={16} />
        {/if}
    </button>
    <pre class="bg-black/80 p-4 pr-12 rounded overflow-x-auto text-sm text-gray-200">{code}</pre>
</div>

