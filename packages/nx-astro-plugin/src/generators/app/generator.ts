import type { GeneratorCallback, Tree } from '@nx/devkit';
import {
  formatFiles,
  generateFiles,
  installPackagesTask,
  joinPathFragments,
  updateJson,
} from '@nx/devkit';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

interface Schema {
  name: string;
  directory?: string;
  typescript?: boolean;
  integrations?: string[];
  eslint?: 'auto' | 'true' | 'false';
  skipInstall?: boolean;
  packageManager?: 'auto' | 'pnpm' | 'npm' | 'yarn' | 'bun';
}

const integrationPackages: Record<string, string> = {
  mdx: '@astrojs/mdx',
  markdoc: '@astrojs/markdoc',
  react: '@astrojs/react',
  preact: '@astrojs/preact',
  svelte: '@astrojs/svelte',
  solid: '@astrojs/solid-js',
  vue: '@astrojs/vue',
  tailwind: '@astrojs/tailwind',
  sitemap: '@astrojs/sitemap',
};

function getIntegrationPackage(name: string): string {
  return integrationPackages[name] ?? `@astrojs/${name}`;
}

function getIntegrationVariable(name: string): string {
  return `${name.replace(/[^a-zA-Z0-9]/g, '')}Integration`;
}

function addIntegrationsToConfig(
  content: string,
  integrationNames: string[],
): string {
  if (integrationNames.length === 0) return content;

  const integrationBindings = integrationNames.map((name) => {
    const packageName = getIntegrationPackage(name);
    const escapedPackageName = packageName.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );
    const existingImport = content.match(
      new RegExp(
        `import\\s+([A-Za-z_$][\\w$]*)\\s+from\\s+['"]${escapedPackageName}['"]`,
      ),
    );
    return {
      packageName,
      variableName: existingImport?.[1] ?? getIntegrationVariable(name),
      hasImport: Boolean(existingImport),
    };
  });
  const imports = integrationBindings
    .filter(({ hasImport }) => !hasImport)
    .map(
      ({ packageName, variableName }) =>
        `import ${variableName} from '${packageName}';`,
    )
    .join('\n');
  const nextContent = imports ? `${imports}\n${content}` : content;

  const calls = integrationBindings
    .map(({ variableName }) => `${variableName}()`)
    .join(', ');
  if (/integrations\s*:\s*\[/.test(nextContent)) {
    return nextContent.replace(
      /integrations\s*:\s*\[([^\]]*)\]/,
      (_, existing: string) => {
        const existingCalls = existing.trim();
        const newCalls = integrationBindings
          .filter(
            ({ variableName }) => !existingCalls.includes(`${variableName}(`),
          )
          .map(({ variableName }) => `${variableName}()`)
          .join(', ');
        return newCalls
          ? `integrations: [${existingCalls}${existingCalls ? ', ' : ''}${newCalls}]`
          : `integrations: [${existingCalls}]`;
      },
    );
  }

  return nextContent.replace(
    /defineConfig\(\{/,
    `defineConfig({\n  integrations: [${calls}],`,
  );
}

function shouldConfigureEslint(tree: Tree, option: Schema['eslint']): boolean {
  if (option === 'false') return false;
  if (option === 'true') return true;
  if (!tree.exists('package.json')) return false;

  const packageJson = JSON.parse(
    tree.read('package.json', 'utf-8') ?? '{}',
  ) as {
    devDependencies?: Record<string, string>;
    dependencies?: Record<string, string>;
  };
  return Boolean(
    packageJson.devDependencies?.['eslint'] ??
      packageJson.dependencies?.['eslint'],
  );
}

function getPackageManager(
  tree: Tree,
  requested: Schema['packageManager'],
): 'pnpm' | 'npm' | 'yarn' | 'bun' {
  if (requested && requested !== 'auto') {
    return requested;
  }
  if (tree.exists('pnpm-lock.yaml')) return 'pnpm';
  if (tree.exists('yarn.lock')) return 'yarn';
  if (tree.exists('bun.lockb')) return 'bun';
  return 'npm';
}

function createProjectConfiguration(
  projectName: string,
  projectRoot: string,
  outDir: string,
) {
  return {
    name: projectName,
    $schema: '../../node_modules/nx/schemas/project-schema.json',
    sourceRoot: `${projectRoot}/src`,
    targets: {
      dev: { executor: '@forastro/nx-astro-plugin:dev', options: {} },
      build: {
        executor: '@forastro/nx-astro-plugin:build',
        options: { outDir },
        outputs: [`{projectRoot}/${outDir}`],
      },
      preview: {
        executor: '@forastro/nx-astro-plugin:preview',
        options: { outDir },
      },
      check: { executor: '@forastro/nx-astro-plugin:check', options: {} },
      sync: { executor: '@forastro/nx-astro-plugin:sync', options: {} },
      'type-check': {
        executor: 'nx:run-commands',
        options: {
          command: 'astro check',
          cwd: projectRoot,
        },
      },
    },
  };
}

/** Generates a complete Astro application in the Nx virtual tree. */
export default async function generator(
  tree: Tree,
  options: Schema,
): Promise<GeneratorCallback | undefined> {
  const projectRoot = joinPathFragments(
    options.directory ?? 'apps',
    options.name,
  );
  const templateDirectory = join(
    dirname(fileURLToPath(import.meta.url)),
    'templates',
    'astro-min',
  );

  // The scaffold is generated into the Tree rather than by create-astro. This
  // keeps dry runs side-effect free and makes subsequent generators see files
  // created by this generator in the same invocation.
  generateFiles(tree, templateDirectory, projectRoot, {
    tmpl: '',
    name: options.name,
  });

  const configPath = joinPathFragments(projectRoot, 'astro.config.ts');
  const configContent =
    tree.read(configPath, 'utf-8') ??
    `import { defineConfig } from 'astro/config';\n\nexport default defineConfig({});\n`;
  const integrationNames = Array.from(
    new Set(
      (options.integrations ?? []).map((name) => name.trim()).filter(Boolean),
    ),
  );
  tree.write(
    configPath,
    addIntegrationsToConfig(configContent, integrationNames),
  );

  if (options.typescript === false) {
    tree.delete(configPath);
    tree.write(
      joinPathFragments(projectRoot, 'astro.config.mjs'),
      addIntegrationsToConfig(configContent, integrationNames).replace(
        /: [A-Za-z]+(?=\s*[,}])/g,
        '',
      ),
    );
    if (tree.exists(joinPathFragments(projectRoot, 'tsconfig.json'))) {
      tree.delete(joinPathFragments(projectRoot, 'tsconfig.json'));
    }
  }

  const packagePath = joinPathFragments(projectRoot, 'package.json');
  if (tree.exists(packagePath)) {
    updateJson(tree, packagePath, (packageJson) => {
      packageJson.name = options.name;
      packageJson.private = true;
      packageJson.devDependencies ??= {};
      packageJson.devDependencies.astro ??= '^7.3.2';
      for (const name of integrationNames) {
        packageJson.dependencies ??= {};
        packageJson.dependencies[
          integrationPackages[name] ?? `@astrojs/${name}`
        ] ??= '^1.0.0';
      }
      if (shouldConfigureEslint(tree, options.eslint ?? 'auto')) {
        packageJson.devDependencies.eslint ??= '^9.33.0';
        packageJson.devDependencies['eslint-plugin-astro'] ??= '^1.3.1';
      }
      return packageJson;
    });
  }

  if (shouldConfigureEslint(tree, options.eslint ?? 'auto')) {
    tree.write(
      joinPathFragments(projectRoot, 'eslint.config.mjs'),
      `import eslintPluginAstro from 'eslint-plugin-astro';\n\nexport default [...eslintPluginAstro.configs.recommended];\n`,
    );
  }

  const projectJsonPath = joinPathFragments(projectRoot, 'project.json');
  if (!tree.exists(projectJsonPath)) {
    tree.write(
      projectJsonPath,
      JSON.stringify(
        createProjectConfiguration(options.name, projectRoot, 'dist'),
        null,
        2,
      ),
    );
  }

  await formatFiles(tree);

  if (options.skipInstall) return undefined;
  const packageManager = getPackageManager(tree, options.packageManager);
  return () => installPackagesTask(tree, true, projectRoot, packageManager);
}
