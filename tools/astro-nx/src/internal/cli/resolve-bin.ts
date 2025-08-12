import { existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

/**
 * Resolves the Astro binary path with preference hierarchy:
 * 1) projectRoot/node_modules/.bin/astro
 * 2) workspaceRoot/node_modules/.bin/astro  
 * 3) "astro" in PATH
 * 
 * Why this hierarchy: Monorepos often have project-specific Astro versions.
 * We prioritize local installations to avoid version mismatches and respect
 * project-specific configurations.
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
  
  // 3) Fallback to PATH - on Windows, prefer astro.cmd if available, otherwise astro
  if (process.platform === 'win32') {
    try {
      execSync('where astro.cmd', { stdio: 'ignore' });
      return 'astro.cmd';
    } catch {
      return 'astro';
    }
  }
  
  return 'astro';
}

/**
 * Resolves the package manager with preference hierarchy:
 * 1) JPD if found in PATH (jpd)
 * 2) pnpm if found in PATH
 * 3) npm (default fallback)
 * 
 * Why this order: Respects user's preferred package manager as configured in
 * their environment. JPD is a custom CLI, pnpm offers better performance,
 * npm is the universal fallback.
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
