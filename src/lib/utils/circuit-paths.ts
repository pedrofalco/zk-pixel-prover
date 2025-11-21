import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Resolves circuit file paths for both development and production builds
 * In production, files are in static/, in development they're in src/
 */
export function getCircuitPath(relativePath: string): string {
    const cwd = process.cwd();
    
    // Remove 'lib/' prefix from relativePath if present (for consistency)
    const cleanPath = relativePath.replace(/^lib\//, '');
    
    // Try static/ first (production)
    const staticPath = join(cwd, 'static', 'circuits', cleanPath.replace(/^circuits\//, ''));
    if (existsSync(staticPath)) {
        return staticPath;
    }
    
    // Fallback to src/ (development)
    const srcPath = join(cwd, 'src', 'lib', 'circuits', cleanPath.replace(/^circuits\//, ''));
    if (existsSync(srcPath)) {
        return srcPath;
    }
    
    // Last resort: return static path (will throw error if doesn't exist)
    return staticPath;
}

