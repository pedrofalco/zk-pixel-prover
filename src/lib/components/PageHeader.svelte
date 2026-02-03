<script lang="ts">
    export let title: string;
    export let description: string;
</script>

<div class="text-center md:mb-8 max-w-3xl font-mono p-4 md:px-4">
    <h1 class="text-xl md:text-3xl font-extrabold mb-2 md:mb-4 md:drop-shadow-lg">
        {title}
    </h1>
    <p class="opacity-95 leading-relaxed text-sm md:text-base">
        {@html description}
    </p>
</div>

