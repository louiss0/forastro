import { Tree, updateJson, formatFiles } from '@nx/devkit';
import { workspaceHasEslint } from '../../utils/pm';

interface Schema {
  eslint?: 'auto' | 'true' | 'false';
  addTargetDefaults?: boolean;
  astroVersion?: string;
}

export default async function init(tree: Tree, options: Schema) {
  // Optionally set target defaults in nx.json
  if (options.addTargetDefaults !== false && tree.exists('nx.json')) {
    updateJson(tree, 'nx.json', (nx) => {
      nx.targetDefaults = nx.targetDefaults || {};
      nx.targetDefaults['@forastro/nx-astro-plugin:build'] = {
        cache: true,
        inputs: ['production', '^production'],
        outputs: ['{projectRoot}/dist']
      };
      nx.targetDefaults['@forastro/nx-astro-plugin:dev'] = { cache: false };
      nx.targetDefaults['@forastro/nx-astro-plugin:preview'] = { cache: false };
      nx.targetDefaults['@forastro/nx-astro-plugin:check'] = { cache: true };
      nx.targetDefaults['@forastro/nx-astro-plugin:sync'] = { cache: false };
      return nx;
    });
  }

  // ESLint detection hint (no installation here per your preference)
  const hasEslint = workspaceHasEslint(tree.root);
  if (options.eslint !== 'false' && hasEslint) {
    // We could prompt users to add eslint-plugin-astro in README; avoid auto installs here.
  }

  await formatFiles(tree);
}