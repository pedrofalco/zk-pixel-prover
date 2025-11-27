<script lang="ts">
    import Navbar from '$lib/components/Navbar.svelte';
    import SocialLinks from '$lib/components/SocialLinks.svelte';
    import GithubCorner from '$lib/components/ui/GithubCorner.svelte';
    import '../app.css';
    
    let { children } = $props();
</script>

<Navbar />
<main>
    <GithubCorner />
    {@render children()}
</main>
<SocialLinks />
