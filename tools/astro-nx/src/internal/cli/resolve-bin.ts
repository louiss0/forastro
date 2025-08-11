import { existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

/**
 * Resolves the Astro binary path with preference hierarchy:
 * 1) projectRoot/node_modules/.bin/astro
 * 2) workspaceRoot/node_modules/.bin/astro  
 * 3) "astro" in PATH
 */
export function resolveAstroBin(workspaceRoot: string, projectRoot: string): string {
  const astroBinName = process.platform === 'win32' ? 'astro.cmd' : 'astro';
  
  // 1) Prefer projectRoot/node_modules/.bin/astro
  const projectBin = join(projectRoot, 'node_modules', '.bin', astroBinName);
  if (existsSync(projectBin)) {
    return projectBin;
  }
  
  // 2) Fallback to workspaceRoot/node_modules/.bin/astro
  const workspaceBin = join(workspaceRoot, 'node_modules', '.bin', astroBinName);
  if (existsSync(workspaceBin)) {
    return workspaceBin;
  }
  
  // 3) Fallback to "astro" in PATH
  return 'astro';
}

/**
 * Resolves the package manager with preference hierarchy:
 * 1) JPD if found in PATH (jpd)
 * 2) pnpm if found in PATH
 * 3) npm (default fallback)
 */
export function resolvePackageManager(): string {
  try {
    // Prefer JPD if found in PATH
    execSync('which jpd', { stdio: 'ignore' });
    return 'jpd';
  } catch {
    try {
      // Else pnpm if found
      execSync('which pnpm', { stdio: 'ignore' });
      return 'pnpm';
    } catch {
      // Else npm
      return 'npm';
    }
  }
}
