import type { ExecutorContext } from '@nx/devkit';
import { execa } from 'execa';
import { join } from 'node:path';
import { resolveAstroBinary } from '../../utils/pm.js';

interface Options {
  config?: string;
  verbose?: boolean;
  allowGlobal?: boolean;
  binOverride?: string;
  args?: string[];
}

/**
 * Resolves the project's working directory from the executor context.
 *
 * @param context - Nx executor context containing workspace and project configuration
 * @returns Absolute path to the project directory
 * @throws {Error} If the project name is not found in the executor context
 */
function projectCwd(context: ExecutorContext): string {
  const projectName = context.projectName;
  if (!projectName) {
    throw new Error('Project name is required but was not found in executor context');
  }
  const projRoot = context.projectsConfigurations?.projects?.[projectName]?.root;
  return projRoot ? join(context.root, projRoot) : (context.root || process.cwd());
}

/**
 * Executes Astro's sync command to generate TypeScript types for content collections.
 *
 * This executor runs `astro sync` to automatically generate TypeScript definitions
 * for your content collections based on their schemas. This ensures type safety when
 * working with content collection entries throughout your project.
 *
 * @param options - Sync executor options from schema.json
 * @param options.config - Optional path to custom Astro config file
 * @param options.verbose - Enable verbose output with detailed sync information
 * @param options.allowGlobal - Whether to allow using a globally installed Astro binary (default: true)
 * @param options.binOverride - Optional path to override the Astro binary location (primarily for testing)
 * @param options.args - Additional arguments to pass to the Astro CLI
 * @param context - Nx executor context containing workspace and project configuration
 * @returns Promise resolving to an object with a success boolean
 *
 * @example
 * // Run sync to generate content collection types
 * nx run my-site:sync
 *
 * @example
 * // Run sync after modifying content/config.ts
 * nx run my-site:sync --verbose=true
 */
export default async function runExecutor(options: Options, context: ExecutorContext) {
  const cwd = projectCwd(context);
  const workspaceRoot = context.root || process.cwd();

  let astroBin: string;
  try {
astroBin = options.binOverride || (await resolveAstroBinary(cwd, workspaceRoot, options.allowGlobal ?? true));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(msg);
    return { success: false };
  }

  const args = ['sync'];
  if (options.config) args.push('--config', options.config);
  if (options.verbose) args.push('--verbose');
  if (options.args) args.push(...options.args);

  try {
    await execa(astroBin, args, { cwd, stdio: 'inherit' });
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(msg);
    return { success: false };
  }
}
