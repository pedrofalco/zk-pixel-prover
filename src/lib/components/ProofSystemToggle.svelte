<script lang="ts">
    export let system: 'groth16' | 'plonk' = 'plonk';
    export let onSystemChange: (system: 'groth16' | 'plonk') => void;
</script>

<div class="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-lg rounded-xs border border-white/20">
    <span class="text-sm font-semibold text-black/70">Proof System:</span>
    <div class="flex gap-2">
        <button
            onclick={() => onSystemChange('groth16')}
            class="px-4 py-2 rounded-xs font-semibold transition-colors border-2 {system === 'groth16' ? 'bg-black text-white border-black' : 'bg-transparent text-black border-black/30 hover:bg-black/10'}"
        >
            Groth16
        </button>
        <button
            onclick={() => onSystemChange('plonk')}
            class="px-4 py-2 rounded-xs font-semibold transition-colors border-2 {system === 'plonk' ? 'bg-black text-white border-black' : 'bg-transparent text-black border-black/30 hover:bg-black/10'}"
        >
            PLONK
        </button>
    </div>
</div>

