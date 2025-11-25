<script lang="ts">
    import { downloadImage } from '$lib/utils/download';
    
    export let imagePath: string;
    export let filename: string;
    export let errorMessage: string;
    export let text: string;
    export let title: string;
</script>

<button
    onclick={() => downloadImage(imagePath, filename, errorMessage)}
    class="underline text-black font-semibold hover:opacity-80 transition-opacity"
    {title}
>{text}</button>
