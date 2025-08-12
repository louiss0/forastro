/**
 * CLI argument builder utilities for Astro Nx executors
 * Provides consistent argument building behavior across all executors
 */

/**
 * Builds command line arguments from a base command and flag-value pairs.
 * 
 * Why this exists: Astro CLI expects precise flag formatting and executors need
 * consistent behavior. This centralizes the logic to avoid duplicating conditional
 * argument building across multiple executors.
 * 
 * Rules:
 * - For boolean flags, include the flag only when true (do not include when false/undefined)
 * - For string/number flags, include flag and value only when value is defined
 * - Preserve insertion order to satisfy tests requiring exact arg order
 * 
 * @param base - Base arguments to start with (e.g., ['build', 'dev'])
 * @param pairs - Array of [flag, value] pairs to append conditionally
 * @returns Array of command line arguments
 */
export function buildArgs(
  base: string[], 
  pairs: Array<[flag: string, value: string | number | boolean | undefined]>
): string[] {
  const args: string[] = [...base];
  
  for (const [flag, value] of pairs) {
    if (value === undefined || value === null) {
      // Skip undefined or null values
      continue;
    }
    
    if (typeof value === 'boolean') {
      // For boolean flags, include the flag only when true
      if (value) {
        args.push(flag);
      }
    } else {
      // For string/number flags, include flag and value
      args.push(flag, String(value));
    }
  }
  
  return args;
}
