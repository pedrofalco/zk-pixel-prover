<script lang="ts">
    import { Github, Globe, Twitter, Linkedin } from 'lucide-svelte';
    
    const socialLinks = [
        { 
            name: 'GitHub', 
            icon: Github, 
            url: 'https://github.com/pedrofalco'
        },
        { 
            name: 'Web', 
            icon: Globe, 
            url: 'https://pedrofalco.com'
        },
        { 
            name: 'Twitter', 
            icon: Twitter, 
            url: 'https://x.com/_pedrofalco'
        },
        { 
            name: 'LinkedIn', 
            icon: Linkedin, 
            url: 'https://linkedin.com/in/pedrofalco'
        }
    ];
</script>

<div class="fixed bottom-2 right-2 flex gap-1.5 z-50">
    {#each socialLinks as link}
        <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            class="p-1.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg"
            title={link.name}
            aria-label={link.name}
        >
            <svelte:component this={link.icon} size={14} />
        </a>
    {/each}
</div>

