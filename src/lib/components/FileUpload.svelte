<script lang="ts">
    export let accept: string = '.json,application/json';
    export let label: string = 'Upload file';
    export let onFileSelected: ((file: File) => void) | null = null;
    export let processing: boolean = false;
    export let processingMessage: string = 'Processing...';
    export let icon: string = '📄';
    
    let fileInput: HTMLInputElement;
    let isDragging = false;
    let dropZone: HTMLDivElement;
    let dragCounter = 0;

    async function handleFileSelect(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (!file) return;
        if (onFileSelected) {
            onFileSelected(file);
        }
    }

    function handleDragEnter(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        dragCounter++;
        if (event.dataTransfer?.items && event.dataTransfer.items.length > 0) {
            isDragging = true;
        }
    }

    function handleDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    function handleDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        dragCounter--;
        if (dragCounter === 0) {
            isDragging = false;
        }
    }

    async function handleDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        dragCounter = 0;
        isDragging = false;
        
        const files = event.dataTransfer?.files;
        if (files && files.length > 0 && onFileSelected) {
            onFileSelected(files[0]);
        }
    }

    function triggerFileInput() {
        fileInput?.click();
    }
</script>

<div class="flex flex-col items-center gap-4 w-full">
    <input
        bind:this={fileInput}
        type="file"
        {accept}
        onchange={handleFileSelect}
        class="hidden"
    />
    
    <div
        bind:this={dropZone}
        role="button"
        tabindex="0"
        class="w-full border-2 border-dashed rounded-xs p-8 transition-colors duration-200 {isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50/50'}"
        ondragenter={handleDragEnter}
        ondragover={handleDragOver}
        ondragleave={handleDragLeave}
        ondrop={handleDrop}
    >
        <div class="flex flex-col items-center gap-4 text-center">
            <div class="text-4xl">
                {#if processing}
                    {icon}
                {:else if isDragging}
                    📥
                {:else}
                    {icon}
                {/if}
            </div>
            <div>
                {#if processing}
                    <p class=" font-semibold text-gray-700">{processingMessage}</p>
                {:else if isDragging}
                    <p class=" font-semibold text-purple-700">Drop your file here</p>
                {:else}
                    <p class=" font-semibold text-gray-700 mb-2">Drag & drop your file</p>
                    <p class="text-sm text-gray-500 mb-4">or</p>
                    <button
                        onclick={triggerFileInput}
                        disabled={processing}
                        class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Browse Files
                    </button>
                {/if}
            </div>
            <p class="text-xs text-gray-400 mt-2">
                {label}
            </p>
        </div>
    </div>
</div>

