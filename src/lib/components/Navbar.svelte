<script lang="ts">
    import { page } from '$app/stores';
</script>

<nav class="w-full font-mono">
    <div class="max-w-6xl mx-auto p-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
        <a href="/" class="text-base md:text-xl font-bold text-black hover:opacity-80 transition-opacity">
            ZK Pixel Signature
        </a>
        <div class="flex gap-2 md:gap-4 w-full md:w-auto">
            <a
                href="/generate"
                class="flex-1 md:flex-none px-3 md:px-4 py-2 rounded-xs text-sm md:text-base font-semibold transition-colors border-2 border-black text-center {$page.url.pathname === '/generate' ? 'bg-black text-white' : 'bg-transparent text-black hover:bg-black/10'}"
            >
                Generate
            </a>
            <a
                href="/verify"
                class="flex-1 md:flex-none px-3 md:px-4 py-2 rounded-xs text-sm md:text-base font-semibold transition-colors border-2 border-black text-center {$page.url.pathname === '/verify' ? 'bg-black text-white' : 'bg-transparent text-black hover:bg-black/10'}"
            >
                Verify
            </a>
        </div>
    </div>
</nav>

