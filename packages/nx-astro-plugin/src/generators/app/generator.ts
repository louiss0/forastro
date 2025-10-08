import type { Tree } from '@nx/devkit';
import {
  formatFiles,
  joinPathFragments,
  generateFiles,
  updateJson,
} from '@nx/devkit';
import { execa } from 'execa';
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
}

export default async function generator(tree: Tree, options: Schema) {
  const dir = options.directory ?? 'apps';
  const projectName = options.name;
  const projectRoot = joinPathFragments(dir, projectName);

  if (options.offlineStrategy === 'copy-fixture') {
    const fileName = fileURLToPath(import.meta.url);
    const dirName = dirname(fileName);
    const pkgRoot = join(dirName, '..', '..', '..', '..');
    const tplPath = joinPathFragments(
      pkgRoot,
      'src',
      'generators',
      'app',
      'templates',
      'astro-min',
    );
    generateFiles(tree, tplPath, projectRoot, {
      tmpl: '',
      name: projectName,
    });
  } else {
    // Run create-astro with the full project path to avoid directory conflicts
    const args = [
      'create-astro@latest',
      projectRoot,
      '--template',
      options.template ?? 'minimal',
      '--git',
      'false',
      '--install',
      'false',
      '--yes',
    ];
    // Runner selection: default to npx, allow override by env FORASTRO_PM=jpd|pnpm
    async function has(cmd: string) {
      try {
        await execa(cmd, ['--version'], { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    }
    const prefer = (
      (process.env['FORASTRO_PM'] as string | undefined) || ''
    ).toLowerCase();
    if (prefer === 'jpd' && (await has('jpd'))) {
      await execa('jpd', ['dlx', ...args], {
        stdio: 'inherit',
        cwd: tree.root,
      });
    } else if (prefer === 'pnpm' && (await has('pnpm'))) {
      await execa('pnpm', ['dlx', ...args], {
        stdio: 'inherit',
        cwd: tree.root,
      });
    } else {
      await execa('npx', args, { stdio: 'inherit', cwd: tree.root });
    }
  }

  // Ensure project folder exists in Tree when created by external command
  if (!tree.exists(projectRoot)) {
    // refresh from disk if needed (Nx tree may not see external files). In Nx execution it reads from FS at the end.
  }

  // Add Nx project.json AFTER create-astro completes
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
            build: {
              executor: '@forastro/nx-astro-plugin:build',
              options: { outDir: 'dist' },
              outputs: ['{projectRoot}/dist'],
            },
            preview: {
              executor: '@forastro/nx-astro-plugin:preview',
              options: {},
            },
            check: { executor: '@forastro/nx-astro-plugin:check', options: {} },
            sync: { executor: '@forastro/nx-astro-plugin:sync', options: {} },
          },
        },
        null,
        2,
      ),
    );
  }

  // Ensure package.json has nx.name and astro devDependency
  const pkgPath = join(projectRoot, 'package.json');
  if (tree.exists(pkgPath)) {
    updateJson(tree, pkgPath, (pkg) => {
      pkg.nx = pkg.nx || {};
      pkg.nx.name = projectName;
      pkg.devDependencies = pkg.devDependencies || {};
      if (!pkg.devDependencies.astro) {
        pkg.devDependencies.astro = '^5.0.0';
      }
      return pkg;
    });
  }

  // Optionally run astro add for integrations (deferred: use executor add via Nx after creation)
  // We only annotate here; users can run: nx run <proj>:add --names=mdx,react

  await formatFiles(tree);
}
