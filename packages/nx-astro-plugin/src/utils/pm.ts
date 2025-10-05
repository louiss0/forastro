import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execa } from 'execa';

export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

const LOCKFILE_MAP: Array<{ file: string; pm: PackageManager }> = [
  { file: 'pnpm-lock.yaml', pm: 'pnpm' },
  { file: 'package-lock.json', pm: 'npm' },
  { file: 'yarn.lock', pm: 'yarn' },
  { file: 'bun.lockb', pm: 'bun' },
];

/**
 * Detect package manager by checking lockfiles in project root, then workspace root, then global.
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
 * Resolve astro binary: project local → workspace local → global (if allowed).
 */
export async function resolveAstroBinary(
  projectRoot: string,
  workspaceRoot: string,
  allowGlobal: boolean = true
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
      const { stdout } = await execa('which', [binName], { stdio: 'pipe' });
      if (stdout.trim()) return stdout.trim();
    } catch {
      // which not available or astro not found
    }

    // Windows fallback: check PATH manually
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

export function workspaceHasEslint(workspaceRoot: string): boolean {
  try {
    const pkg = JSON.parse(readFileSync(join(workspaceRoot, 'package.json'), 'utf8'));
    const dev = pkg.devDependencies || {};
    return Boolean(dev.eslint);
  } catch {
    return false;
  }
}
