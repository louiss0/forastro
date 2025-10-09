import type { ExecutorContext } from '@nx/devkit';
import { execa } from 'execa';
import { join } from 'node:path';
import { resolveAstroBinary } from '../../utils/pm.js';

interface Options {
  outDir?: string;
  config?: string;
  allowGlobal?: boolean;
  binOverride?: string;
  args?: string[];
}

/**
 * Resolves the project's working directory from the executor context.
 *
 * This function determines the absolute path to the project directory by
 * combining the workspace root with the project's relative root path.
 * It ensures the executor operates in the correct directory for the target project.
 *
 * @param context - Nx executor context containing workspace and project configuration
 * @returns Absolute path to the project directory
 * @throws {Error} If the project name is not found in the executor context
 *
 * @example
 * const cwd = projectCwd(context);
 * // Returns: '/workspace/apps/my-site'
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
 * Executes the Astro build command for a project.
 *
 * This executor runs `astro build` to create a production-ready build of an Astro project.
 * It resolves the Astro binary (project-local, workspace-local, or global), constructs
 * the appropriate command-line arguments, and executes the build process.
 *
 * @param options - Build executor options from schema.json
 * @param options.outDir - Optional custom output directory for the build
 * @param options.config - Optional path to custom Astro config file
 * @param options.allowGlobal - Whether to allow using a globally installed Astro binary (default: true)
 * @param options.binOverride - Optional path to override the Astro binary location (primarily for testing)
 * @param options.args - Additional arguments to pass to the Astro CLI
 * @param context - Nx executor context containing workspace and project configuration
 * @returns Promise resolving to an object with a success boolean
 *
 * @example
 * // Run via Nx CLI
 * nx run my-site:build
 *
 * @example
 * // With custom config
 * nx run my-site:build --config=astro.config.prod.ts
 *
 * @example
 * // Programmatic usage
 * const result = await runExecutor(
 *   { outDir: 'dist/custom', config: 'astro.config.ts' },
 *   context
 * );
 * if (result.success) {
 *   console.log('Build completed successfully');
 * }
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

  const args = ['build'];
  if (options.config) args.push('--config', options.config);
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
