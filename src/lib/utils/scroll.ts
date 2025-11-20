/**
 * Smoothly scroll to an element
 */
export function scrollToElement(element: HTMLElement | null, delay: number = 100): void {
    if (!element) return;
    
    setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, delay);
}

