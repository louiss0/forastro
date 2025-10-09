import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execa } from 'execa';

export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

export interface ExecRunner {
  npx: string;
  runner: string[]; // e.g., ['dlx']
}

/**
 * Gets the appropriate command runner for a package manager.
 *
 * Returns the executable name and runner arguments needed to execute
 * packages with each package manager (similar to `npx`).
 *
 * @param pm - Package manager type: 'pnpm', 'npm', 'yarn', or 'bun'
 * @returns Object containing npx equivalent and runner arguments
 *
 * @example
 * const { npx, runner } = getExecFor('pnpm');
 * // Returns: { npx: 'pnpm', runner: ['dlx'] }
 * await execa(npx, [...runner, 'create-astro']);
 *
 * @example
 * const { npx, runner } = getExecFor('npm');
 * // Returns: { npx: 'npx', runner: [] }
 * await execa(npx, [...runner, 'astro', 'add', 'react']);
 */
export function getExecFor(pm: PackageManager): ExecRunner {
  switch (pm) {
    case 'pnpm':
      return { npx: 'pnpm', runner: ['dlx'] };
    case 'yarn':
      return { npx: 'yarn', runner: ['dlx'] };
    case 'bun':
      return { npx: 'bunx', runner: [] };
    case 'npm':
    default:
      return { npx: 'npx', runner: [] };
  }
}

const LOCKFILE_MAP: Array<{ file: string; pm: PackageManager }> = [
  { file: 'pnpm-lock.yaml', pm: 'pnpm' },
  { file: 'package-lock.json', pm: 'npm' },
  { file: 'yarn.lock', pm: 'yarn' },
  { file: 'bun.lockb', pm: 'bun' },
];

/**
 * Detects the package manager in use by checking lockfiles.
 *
 * Uses a three-tier detection strategy:
 * 1. Checks project root for lockfiles (pnpm-lock.yaml, package-lock.json, etc.)
 * 2. Checks workspace root for lockfiles
 * 3. Falls back to global package manager detection by running --version
 *
 * @param projectRoot - Absolute path to the project directory
 * @param workspaceRoot - Absolute path to the workspace root directory
 * @returns Promise resolving to the detected package manager
 * @throws Error if no package manager is detected or installed
 *
 * @example
 * const pm = await detectPackageManager(
 *   '/workspace/apps/my-site',
 *   '/workspace'
 * );
 * console.log(`Using package manager: ${pm}`);
 * // Output: "Using package manager: pnpm"
 */
export async function detectPackageManager(
  projectRoot: string,
  workspaceRoot: string
): Promise<PackageManager> {
  // 1. Check project root for lockfiles
  for (const { file, pm } of LOCKFILE_MAP) {
    if (existsSync(join(projectRoot, file))) {
      return pm;
    }
  }

  // 2. Check workspace root for lockfiles
  for (const { file, pm } of LOCKFILE_MAP) {
    if (existsSync(join(workspaceRoot, file))) {
      return pm;
    }
  }

  // 3. Fallback to global detection
  for (const pm of ['pnpm', 'npm', 'yarn', 'bun'] as PackageManager[]) {
    try {
      await execa(pm, ['--version'], { stdio: 'ignore' });
      return pm;
    } catch {
      // Not available
    }
  }

  throw new Error('No package manager detected. Install pnpm, npm, yarn, or bun.');
}

/**
 * Resolves the path to the Astro binary.
 *
 * Uses a three-tier resolution strategy to find the Astro CLI:
 * 1. Project-local: node_modules/.bin/astro in project directory
 * 2. Workspace-local: node_modules/.bin/astro in workspace root
 * 3. Global: system-wide installation (if allowGlobal is true)
 *
 * On Windows, looks for astro.cmd instead of astro.
 *
 * @param projectRoot - Absolute path to the project directory
 * @param workspaceRoot - Absolute path to the workspace root directory
 * @param allowGlobal - Whether to allow using a globally installed Astro binary (default: true)
 * @returns Promise resolving to the absolute path to the Astro binary
 * @throws Error with installation instructions if Astro is not found
 *
 * @example
 * // Resolve Astro binary with global fallback
 * const astroBin = await resolveAstroBinary(
 *   '/workspace/apps/my-site',
 *   '/workspace',
 *   true
 * );
 * await execa(astroBin, ['build']);
 *
 * @example
 * // Resolve only local installations (no global fallback)
 * try {
 *   const astroBin = await resolveAstroBinary(projectRoot, workspaceRoot, false);
 * } catch (err) {
 *   console.error('Astro must be installed locally');
 * }
 *
 * @remarks
 * Platform-specific behavior:
 * - Windows: Searches for 'astro.cmd' and uses 'where' command
 * - Unix/Mac: Searches for 'astro' and uses 'which' command
 */
export async function resolveAstroBinary(
  projectRoot: string,
  workspaceRoot: string,
  allowGlobal = true
): Promise<string> {
  const isWindows = process.platform === 'win32';
  const binName = isWindows ? 'astro.cmd' : 'astro';

  // 1. Project-local
  const projectBin = join(projectRoot, 'node_modules', '.bin', binName);
  if (existsSync(projectBin)) {
    return projectBin;
  }

  // 2. Workspace-local
  const workspaceBin = join(workspaceRoot, 'node_modules', '.bin', binName);
  if (existsSync(workspaceBin)) {
    return workspaceBin;
  }

  // 3. Global (if allowed)
  if (allowGlobal) {
    try {
      if (isWindows) {
        const { stdout } = await execa('where', [binName], { stdio: 'pipe' });
        const first = stdout.split(/\r?\n/).find(Boolean)?.trim();
        if (first) return first;
      } else {
        const { stdout } = await execa('which', [binName], { stdio: 'pipe' });
        if (stdout.trim()) return stdout.trim();
      }
    } catch {
      // binary not found globally
    }

    // Windows extra fallback: check PATH by executing
    if (isWindows) {
      try {
        await execa('astro', ['--version'], { stdio: 'ignore' });
        return 'astro.cmd';
      } catch {
        // Not on PATH
      }
    }
  }

  // 4. Not found
  const pm = await detectPackageManager(projectRoot, workspaceRoot).catch(() => 'pnpm');
  throw new Error(
    `Astro is not installed locally or in the workspace.\n` +
      `Please install it as a devDependency:\n\n` +
      `  ${pm} add -D astro\n\n` +
      `If you have astro installed globally and want to use it, ensure allowGlobal is enabled.`
  );
}

/**
 * Checks if ESLint is installed in the workspace.
 *
 * Reads the workspace package.json and checks if 'eslint' is present
 * in devDependencies. This is used to determine whether to suggest
 * or configure ESLint-related features.
 *
 * @param workspaceRoot - Absolute path to the workspace root directory
 * @returns True if ESLint is installed in devDependencies, false otherwise
 *
 * @example
 * const hasEslint = workspaceHasEslint('/workspace');
 * if (hasEslint) {
 *   console.log('ESLint is available, suggesting eslint-plugin-astro');
 * }
 *
 * @remarks
 * Only checks devDependencies, not dependencies or global installations.
 * Returns false if package.json cannot be read or parsed.
 */
export function workspaceHasEslint(workspaceRoot: string): boolean {
  try {
    const pkg = JSON.parse(readFileSync(join(workspaceRoot, 'package.json'), 'utf8'));
    const dev = pkg.devDependencies || {};
    return Boolean(dev.eslint);
  } catch {
    return false;
  }
}
