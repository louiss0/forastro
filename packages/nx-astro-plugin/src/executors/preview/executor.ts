import type { ExecutorContext } from '@nx/devkit';
import { execa } from 'execa';
import { join } from 'node:path';
import { resolveAstroBinary } from '../../utils/pm';

interface Options {
  port?: number;
  host?: string;
  outDir?: string;
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
 * Executes the Astro preview command to preview a production build locally.
 *
 * This executor runs `astro preview` to start a local server that serves the
 * production build. This is useful for testing the built output before deployment.
 *
 * @param options - Preview executor options from schema.json
 * @param options.port - Optional port number for the preview server
 * @param options.host - Optional hostname to bind the server to (e.g., '0.0.0.0' for network access)
 * @param options.outDir - Optional custom output directory to preview
 * @param options.allowGlobal - Whether to allow using a globally installed Astro binary (default: true)
 * @param options.binOverride - Optional path to override the Astro binary location (primarily for testing)
 * @param options.args - Additional arguments to pass to the Astro CLI
 * @param context - Nx executor context containing workspace and project configuration
 * @returns Promise resolving to an object with a success boolean
 *
 * @example
 * // Run via Nx CLI with default port
 * nx run my-site:preview
 *
 * @example
 * // With custom port and host
 * nx run my-site:preview --port=4321 --host=0.0.0.0
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

  const args = ['preview'];
  if (options.port) args.push('--port', String(options.port));
  if (options.host) args.push('--host', options.host);
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
