import type { Tree } from '@nx/devkit';
import { formatFiles, joinPathFragments, generateFiles, updateJson } from '@nx/devkit';
import { execa } from 'execa';
import { detectPackageManager, getExecFor } from '../../utils/pm.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

interface Schema {
  name: string;
  directory?: string;
  template?: string;
  typescript?: boolean;
  integrations?: string[];
  eslint?: 'auto' | 'true' | 'false';
  skipInstall?: boolean;
  offlineStrategy?: 'none' | 'copy-fixture';
  packageManager?: 'auto' | 'jpd' | 'pnpm' | 'npm' | 'yarn';
}

export default async function generator(tree: Tree, options: Schema) {
  const dir = options.directory ?? 'apps';
  const projectName = options.name;
  const projectRoot = joinPathFragments(dir, projectName);

  if (options.offlineStrategy === 'copy-fixture') {
    const fileName = fileURLToPath(import.meta.url);
    const dirName = dirname(fileName);
    const pkgRoot = join(dirName, '..', '..', '..', '..');
    const tplPath = joinPathFragments(pkgRoot, 'src', 'generators', 'app', 'templates', 'astro-min');
    generateFiles(tree, tplPath, projectRoot, {
      tmpl: '',
      name: projectName,
    });
  } else {
    const pm = options.packageManager && options.packageManager !== 'auto' ? options.packageManager : detectPackageManager();
    const { npx, runner } = getExecFor(pm);
    const args: string[] = [];
    if (runner.length) args.push(...runner);
    args.push('create-astro@latest', projectName, '--template', options.template ?? 'minimal', '--git', 'false', '--install', 'false');
    // create-astro may default to TS depending on template; we keep TS default per templates
    await execa(npx, args, { stdio: 'inherit', cwd: tree.root });
  }

  // Ensure project folder exists in Tree when created by external command
  if (!tree.exists(projectRoot)) {
    // refresh from disk if needed (Nx tree may not see external files). In Nx execution it reads from FS at the end.
  }

  // Add Nx project.json
  const projJsonPath = join(projectRoot, 'project.json');
  if (!tree.exists(projJsonPath)) {
    tree.write(
      projJsonPath,
      JSON.stringify(
        {
          name: projectName,
          $schema: '../../node_modules/nx/schemas/project-schema.json',
          sourceRoot: `${projectRoot}/src`,
          targets: {
            dev: { executor: '@forastro/nx-astro-plugin:dev', options: {} },
            build: { executor: '@forastro/nx-astro-plugin:build', options: { outDir: 'dist' }, outputs: ['{projectRoot}/dist'] },
            preview: { executor: '@forastro/nx-astro-plugin:preview', options: {} },
            check: { executor: '@forastro/nx-astro-plugin:check', options: {} },
            sync: { executor: '@forastro/nx-astro-plugin:sync', options: {} }
          }
        },
        null,
        2
      )
    );
  }

  // Ensure package.json has nx.name to stabilize project name
  const pkgPath = join(projectRoot, 'package.json');
  if (tree.exists(pkgPath)) {
    updateJson(tree, pkgPath, (pkg) => {
      pkg.nx = pkg.nx || {};
      pkg.nx.name = projectName;
      return pkg;
    });
  }

  // Optionally run astro add for integrations (deferred: use executor add via Nx after creation)
  // We only annotate here; users can run: nx run <proj>:add --names=mdx,react

  await formatFiles(tree);
}