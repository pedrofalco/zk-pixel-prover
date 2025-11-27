<script lang="ts">
    import { page } from '$app/stores';
</script>

<nav class="w-full font-mono">
    <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" class="text-xl font-bold text-black hover:opacity-80 transition-opacity">
            ZK Pixel Signature
        </a>
        <div class="flex gap-4">
            <a
                href="/generate"
                class="px-4 py-2 rounded-xs font-semibold transition-colors border-2 border-black {$page.url.pathname === '/generate' ? 'bg-black text-white' : 'bg-transparent text-black hover:bg-black/10'}"
            >
                Generate
            </a>
            <a
                href="/verify"
                class="px-4 py-2 rounded-xs font-semibold transition-colors border-2 border-black {$page.url.pathname === '/verify' ? 'bg-black text-white' : 'bg-transparent text-black hover:bg-black/10'}"
            >
                Verify
            </a>
        </div>
    </div>
</nav>

