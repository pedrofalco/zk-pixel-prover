<script lang="ts">
    export let loading = false;
    export let disabled = false;
    export let variant: 'primary' | 'secondary' = 'primary';
    
    const variantClasses = {
        primary: 'bg-blue-700 hover:bg-blue-600',
        secondary: 'bg-green-700 hover:bg-green-600'
    };
</script>

<button 
    class="p-4 font-semibold rounded-sm text-white shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 justify-center min-w-[200px] {variantClasses[variant]}"
    {disabled}
        {...$$restProps}
>
    {#if loading}
        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    {/if}
    <slot />
</button>

