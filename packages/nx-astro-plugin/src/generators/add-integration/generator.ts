import type { Tree } from '@nx/devkit';
import { readProjectConfiguration } from '@nx/devkit';
import { detectPackageManager, getExecFor } from '../../utils/pm';
import type { PackageManager } from '../../utils/pm';
import { execa } from 'execa';

interface Schema {
  project: string;
  names: string[];
  eslint?: 'auto' | 'true' | 'false';
}

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
