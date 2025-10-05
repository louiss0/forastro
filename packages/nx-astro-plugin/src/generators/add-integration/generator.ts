import type { Tree } from '@nx/devkit';
import { readProjectConfiguration } from '@nx/devkit';
import { detectPackageManager, getExecFor } from '../../utils/pm.js';
import { execa } from 'execa';

interface Schema {
  project: string;
  names: string[];
  eslint?: 'auto' | 'true' | 'false';
}

export default async function addIntegration(tree: Tree, options: Schema) {
  const proj = readProjectConfiguration(tree, options.project);
  const pm = detectPackageManager();
  const { npx, runner } = getExecFor(pm);

  for (const name of options.names) {
    const args: string[] = [];
    if (runner.length) args.push(...runner);
    args.push('astro', 'add', name, '--yes');
    await execa(npx, args, { cwd: proj.root, stdio: 'inherit' });
  }
}