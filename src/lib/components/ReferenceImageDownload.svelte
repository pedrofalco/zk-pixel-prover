<script lang="ts">
    
    async function downloadReferenceImage() {
        try {
            const response = await fetch('/sample_4x4.jpeg');
            if (!response.ok) {
                throw new Error('Failed to fetch reference image');
            }
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'sample_4x4.jpeg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading reference image:', err);
            alert('Failed to download reference image');
        }
    }
</script>

<button
    onclick={downloadReferenceImage}
    class="underline text-black font-semibold hover:opacity-80 transition-opacity"
    title="Download the reference image to test the system"
>download the reference image.</button>
