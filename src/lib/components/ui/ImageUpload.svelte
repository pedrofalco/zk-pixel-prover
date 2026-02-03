<script lang="ts">
    import FileUpload from './FileUpload.svelte';
    import { processImageFile } from '$lib/utils/image-processing';
    
    export let onImageProcessed: ((pixels: number[], hash: string) => void) | null = null;
    
    let processing = false;

    async function handleFileSelected(file: File) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            alert(`Unsupported image format: ${file.type}`);
            return;
        }

        // Process image
        processing = true;
        try {
            const { pixels, hash } = await processImageFile(file);
            if (onImageProcessed) {
                onImageProcessed(pixels, hash);
            }
        } catch (err) {
            console.error('Error processing image:', err);
            alert(err instanceof Error ? err.message : 'Failed to process image');
        } finally {
            processing = false;
        }
    }
</script>

<div class="flex flex-col items-center gap-4 w-full">
    <FileUpload
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        label="Supports: JPEG, PNG, WebP, GIF"
        onFileSelected={handleFileSelected}
        processing={processing}
        processingMessage="Processing image..."
        icon={processing ? '⏳' : '📤'}
    />
</div>
