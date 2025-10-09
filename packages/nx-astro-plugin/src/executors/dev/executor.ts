import type { ExecutorContext } from '@nx/devkit';
import { execa } from 'execa';
import { join } from 'node:path';
import { resolveAstroBinary } from '../../utils/pm.js';

interface Options {
  port?: number;
  host?: string;
  root?: string;
  open?: boolean;
  config?: string;
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
 * Executes the Astro development server for a project.
 *
 * This executor runs `astro dev` to start a local development server with hot module
 * replacement (HMR). It watches for file changes and automatically reloads the browser.
 *
 * @param options - Dev server executor options from schema.json
 * @param options.port - Optional port number for the dev server (default: 4321)
 * @param options.host - Optional hostname to bind the server to (e.g., '0.0.0.0' for network access)
 * @param options.root - Optional project root directory
 * @param options.open - Whether to automatically open the browser after starting the server
 * @param options.config - Optional path to custom Astro config file
 * @param options.allowGlobal - Whether to allow using a globally installed Astro binary (default: true)
 * @param options.binOverride - Optional path to override the Astro binary location (primarily for testing)
 * @param options.args - Additional arguments to pass to the Astro CLI
 * @param context - Nx executor context containing workspace and project configuration
 * @returns Promise resolving to an object with a success boolean
 *
 * @example
 * // Run via Nx CLI with default settings
 * nx run my-site:dev
 *
 * @example
 * // With custom port and auto-open browser
 * nx run my-site:dev --port=3000 --open=true
 *
 * @example
 * // Bind to all network interfaces for testing on mobile devices
 * nx run my-site:dev --host=0.0.0.0
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

  const args = ['dev'];
  if (options.port) args.push('--port', String(options.port));
  if (options.host) args.push('--host', options.host);
  if (options.open) args.push('--open');
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
