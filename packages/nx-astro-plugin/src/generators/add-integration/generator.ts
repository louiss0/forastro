import type { Tree } from '@nx/devkit';
import { readProjectConfiguration } from '@nx/devkit';
import { resolveAstroBinary } from '../../utils/pm.js';
import { execa } from 'execa';

interface Schema {
  project: string;
  names: string[];
  eslint?: 'auto' | 'true' | 'false';
}

export default async function addIntegration(tree: Tree, options: Schema) {
  const proj = readProjectConfiguration(tree, options.project);
  const astroBin = await resolveAstroBinary(proj.root, (tree as any).root ?? process.cwd());

  for (const name of options.names) {
    const args: string[] = ['add', name, '--yes'];
    await execa(astroBin, args, { cwd: proj.root, stdio: 'inherit' });
  }
}
