<script lang="ts">
    export let error: string | null = null;
    export let element: HTMLElement | null = null;
</script>

{#if error}
    <div bind:this={element} class="w-full max-w-4xl bg-red-500/20 backdrop-blur-lg rounded-xs p-4 mb-4 flex items-center gap-3 border border-red-400/40">
        <span class="text-2xl">⚠️</span>
        <span>{error}</span>
    </div>
{/if}

