import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type PackageManager = 'jpd' | 'pnpm' | 'npm' | 'yarn';

export function detectPackageManager(): PackageManager {
  const ua = process.env.npm_config_user_agent || '';
  if (/jpd/i.test(ua)) return 'jpd';
  if (/pnpm/i.test(ua)) return 'pnpm';
  if (/yarn/i.test(ua)) return 'yarn';
  return 'npm';
}

export function getExecFor(pm: PackageManager): { npx: string; runner: string[] } {
  switch (pm) {
    case 'pnpm':
      return { npx: process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', runner: ['exec'] };
    case 'yarn':
      return { npx: process.platform === 'win32' ? 'yarn.cmd' : 'yarn', runner: ['dlx'] };
    case 'jpd':
      // Fallback: treat like pnpm exec for now
      return { npx: process.platform === 'win32' ? 'jpd.cmd' : 'jpd', runner: ['exec'] };
    default:
      return { npx: process.platform === 'win32' ? 'npx.cmd' : 'npx', runner: [] };
  }
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