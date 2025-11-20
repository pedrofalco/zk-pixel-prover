<script lang="ts">
    import { pixelToColor } from '$lib/utils/image';
    
    export let pixels: number[];
    export let hash: string;
</script>

<div class="w-full mt-4">
    <div class="text-sm font-semibold mb-2 text-center">Processed Image (4x4 pixels, RGB color) - <span class="text-red-600">BLURRED</span></div>
    <div class="grid grid-cols-4 gap-1 border-2 border-gray-400 p-2 bg-gray-100 rounded-xs blur-sm relative mx-auto w-fit">
        {#each Array(16) as _, i}
            <div 
                class="w-12 h-12 border border-gray-300"
                style="background-color: {pixelToColor(pixels, i)}"
            ></div>
        {/each}
        <div class="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
            <span class="text-white font-bold text-lg">🔒 Hidden</span>
        </div>
    </div>
    <div class="text-xs text-gray-600 font-mono break-all mt-2 text-center">
        Public Hash: {hash}
    </div>
    <p class="text-xs text-gray-500 italic text-center mt-1">
        The actual pixel values are private and never revealed in the proof
    </p>
</div>

