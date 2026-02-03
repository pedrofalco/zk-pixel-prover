<script lang="ts">
    export let system: 'groth16' | 'plonk' = 'plonk';
    export let onSystemChange: (system: 'groth16' | 'plonk') => void;
</script>

<div class="flex items-center gap-3 mb-4">
    <span class="text-xs font-semibold text-black/60">Proof System:</span>
    <div class="inline-flex border-2 border-black/10 rounded-xs overflow-hidden">
        <button
            onclick={() => onSystemChange('groth16')}
            class="px-3 py-1.5 text-sm font-semibold transition-colors border-r-2 border-black/10 {system === 'groth16' ? 'bg-black text-white' : 'bg-transparent text-black hover:bg-black/10'}"
        >
            Groth16
        </button>
        <button
            onclick={() => onSystemChange('plonk')}
            class="px-3 py-1.5 text-sm font-semibold transition-colors border-l-2 border-black/30 {system === 'plonk' ? 'bg-black text-white' : 'bg-transparent text-black hover:bg-black/10'}"
        >
            PLONK
        </button>
    </div>
</div>

