import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Resolves Noir circuit file paths for both development and production builds
 * Similar to circuit-paths.ts but for Noir/PLONK circuits
 */
export function getNoirCircuitPath(relativePath: string): string {
    const cwd = process.cwd();
    
    // Remove 'circuits/' prefix from relativePath if present (for consistency)
    const cleanPath = relativePath.replace(/^circuits\//, '');
    
    // Try static/ first (production)
    const staticPath = join(cwd, 'static', 'circuits', cleanPath);
    if (existsSync(staticPath)) {
        return staticPath;
    }
    
    // Fallback to src/lib/plonk/target/ (development)
    const plonkPath = join(cwd, 'src', 'lib', 'plonk', 'target', cleanPath);
    if (existsSync(plonkPath)) {
        return plonkPath;
    }
    
    // Last resort: return static path (will throw error if doesn't exist)
    return staticPath;
}

