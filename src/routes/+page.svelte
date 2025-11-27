<script>
    import { redirect } from '@sveltejs/kit';
    
    export function load() {
        throw redirect(301, '/generate');
    }
</script>
