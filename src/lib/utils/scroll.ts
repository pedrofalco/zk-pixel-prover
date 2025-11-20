/**
 * Smoothly scroll to an element
 */
export function scrollToElement(element: HTMLElement | null, delay: number = 200): void {
    if (!element) return;
    
    setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    }, delay);
}

