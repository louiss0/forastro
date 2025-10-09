import type { Tree } from '@nx/devkit';
import { readProjectConfiguration } from '@nx/devkit';
import { detectPackageManager, getExecFor } from '../../utils/pm.js';
import type { PackageManager } from '../../utils/pm.js';
import { execa } from 'execa';

interface Schema {
  project: string;
  names: string[];
  eslint?: 'auto' | 'true' | 'false';
}

/**
 * Adds Astro integrations to a project using `astro add`.
 *
 * This generator runs the `astro add` command to install and configure
 * one or more Astro integrations. It handles package installation and
 * automatic configuration updates to astro.config in a single operation.
 *
 * The generator detects the package manager in use (JPD, pnpm, npm, yarn, bun)
 * and uses the appropriate execution command.
 *
 * @param tree - Nx virtual file system tree (not modified, command runs externally)
 * @param options - Integration generator options from schema.json
 * @param options.project - Name of the Nx project to add integrations to
 * @param options.names - Array of integration names to install
 * @param options.eslint - ESLint configuration strategy: 'auto' (detect), 'true', or 'false'
 * @returns Promise that resolves when all integrations are installed
 *
 * @example
 * // Add a single integration
 * nx g @forastro/nx-astro-plugin:add-integration --project=my-site --names=react
 *
 * @example
 * // Add multiple integrations
 * nx g @forastro/nx-astro-plugin:add-integration --project=my-site --names=react,tailwind,mdx
 *
 * @remarks
 * This generator runs `astro add` which:
 * - Installs the integration package via npm/pnpm/etc
 * - Automatically updates astro.config with the integration
 * - Prompts are suppressed with --yes flag for non-interactive operation
 */
export default async function addIntegration(tree: Tree, options: Schema) {
  const proj = readProjectConfiguration(tree, options.project);
  const workspaceRoot = (tree as { root?: string }).root ?? process.cwd();
  const pm = (await Promise.resolve(detectPackageManager(proj.root, workspaceRoot)).catch(() => 'pnpm')) as PackageManager;
  const exec = getExecFor(pm);

  for (const raw of options.names) {
    const name = String(raw).trim();
    if (!name) continue;
    const args: string[] = [...exec.runner, 'astro', 'add', name, '--yes'];
    await execa(exec.npx, args, { cwd: proj.root, stdio: 'inherit' });
  }
}
