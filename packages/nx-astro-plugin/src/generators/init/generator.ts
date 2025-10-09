import type { Tree } from '@nx/devkit';
import { updateJson, formatFiles } from '@nx/devkit';
import { workspaceHasEslint } from '../../utils/pm.js';

interface Schema {
  eslint?: 'auto' | 'true' | 'false';
  addTargetDefaults?: boolean;
  astroVersion?: string;
}

/**
 * Initializes Nx workspace defaults for the Astro plugin.
 *
 * This generator configures workspace-level settings for the Astro plugin,
 * including Nx target defaults for caching and build optimization. It sets
 * up sensible defaults for all Astro executors without modifying individual
 * project configurations.
 *
 * This is typically run once per workspace after installing the plugin.
 *
 * @param tree - Nx virtual file system tree for staging changes to nx.json
 * @param options - Init generator options from schema.json
 * @param options.eslint - ESLint configuration strategy: 'auto' (detect), 'true', or 'false'
 * @param options.addTargetDefaults - Whether to add target defaults to nx.json (default: true)
 * @param options.astroVersion - Optional Astro version to use (for future version management)
 * @returns Promise that resolves when initialization and formatting are complete
 *
 * @example
 * // Initialize with default settings
 * nx g @forastro/nx-astro-plugin:init
 *
 * @example
 * // Initialize without target defaults
 * nx g @forastro/nx-astro-plugin:init --addTargetDefaults=false
 *
 * @remarks
 * Target defaults configured:
 * - build: cacheable with production inputs, outputs to {projectRoot}/dist
 * - dev: not cacheable (development server)
 * - preview: not cacheable (preview server)
 * - check: cacheable (type checking)
 * - sync: not cacheable (type generation)
 */
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