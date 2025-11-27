/**
 * Smoothly scroll to an element with better positioning
 * Uses 'center' to ensure the element is visible in viewport
 * Uses multiple animation frames to ensure DOM is fully updated
 */
export function scrollToElement(element: HTMLElement | null, delay: number = 100): void {
    if (!element) return;
    
    // Use multiple requestAnimationFrame calls to ensure DOM is fully updated
    setTimeout(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // Center the element in viewport for better visibility
                element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',  // Center in viewport for better UX
                    inline: 'nearest' 
                });
            });
        });
    }, delay);
}

