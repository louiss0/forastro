import type { ExecutorContext } from '@nx/devkit';
import { execa } from 'execa';
import { join } from 'node:path';
import { resolveAstroBinary } from '../../utils/pm.js';

interface Options {
  names: string[];
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
  return projRoot ? join(context.root || process.cwd(), projRoot) : (context.root || process.cwd());
}

/**
 * Executes Astro's add command to install and configure integrations.
 *
 * This executor runs `astro add` to automatically install one or more Astro integrations
 * and configure them in your astro.config file. It handles both the npm installation
 * and the configuration update in a single command.
 *
 * @param options - Add executor options from schema.json
 * @param options.names - Array of integration names to install (e.g., ['react', 'tailwind'])
 * @param options.allowGlobal - Whether to allow using a globally installed Astro binary (default: false)
 * @param options.binOverride - Optional path to override the Astro binary location (primarily for testing)
 * @param options.args - Additional arguments to pass to the Astro CLI
 * @param context - Nx executor context containing workspace and project configuration
 * @returns Promise resolving to an object with a success boolean
 *
 * @example
 * // Add a single integration
 * nx run my-site:add --names=react
 *
 * @example
 * // Add multiple integrations at once
 * nx run my-site:add --names=react,tailwind,mdx
 */
export default async function runExecutor(options: Options, context: ExecutorContext) {
  const cwd = projectCwd(context);
  const workspaceRoot = context.root || process.cwd();

  if (!options.names || options.names.length === 0) {
    console.error('No integration names provided. Use --names=<name1,name2,...>');
    return { success: false };
  }

  let astroBin: string;
  try {
    astroBin = options.binOverride || (await resolveAstroBinary(cwd, workspaceRoot, options.allowGlobal ?? false));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(msg);
    return { success: false };
  }

  try {
    for (const name of options.names) {
      const sanitized = String(name).trim();
      if (!sanitized) continue;
      const args = ['add', sanitized, '--yes'];
      if (options.args) args.push(...options.args);
      await execa(astroBin, args, { cwd, stdio: 'inherit' });
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(msg);
    return { success: false };
  }
}