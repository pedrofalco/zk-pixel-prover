<script lang="ts">
    export let title: string;
    export let description: string;
</script>

<div class="text-center mb-8 max-w-3xl font-mono">
    <h1 class="text-xl md:text-3xl font-extrabold mb-4 drop-shadow-lg">
        {title}
    </h1>
    <p class="opacity-95 leading-relaxed">
        {@html description}
    </p>
</div>

