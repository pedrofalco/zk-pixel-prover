<script lang="ts">
    export let variant: 'blue' | 'yellow' = 'blue';
    
    const variantClasses = {
        blue: 'bg-blue-50 border-blue-500',
        yellow: 'bg-yellow-50 border-yellow-500'
    };
</script>

<div class="p-3 rounded-xs border-l-4 text-sm {variantClasses[variant]}">
    <slot />
</div>

