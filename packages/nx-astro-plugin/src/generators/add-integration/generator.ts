import type { GeneratorCallback, Tree } from '@nx/devkit';
import {
  formatFiles,
  installPackagesTask,
  joinPathFragments,
  readProjectConfiguration,
  updateJson,
} from '@nx/devkit';

interface Schema {
  project: string;
  names: string[];
  packageManager?: 'auto' | 'pnpm' | 'npm' | 'yarn' | 'bun';
  skipInstall?: boolean;
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

function updateAstroConfig(content: string, names: string[]): string {
  const bindings = names.map((name) => {
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
  const newImports = bindings
    .filter(({ hasImport }) => !hasImport)
    .map(
      ({ packageName, variableName }) =>
        `import ${variableName} from '${packageName}';`,
    )
    .join('\n');
  const imports = newImports ? `${newImports}\n${content}` : content;
  const integrationsPattern = /integrations\s*:\s*\[([\s\S]*?)\]/;
  const integrations = imports.match(integrationsPattern);

  if (integrations) {
    const existing = integrations[1]?.trim() ?? '';
    const newCalls = bindings
      .filter(({ variableName }) => !existing.includes(`${variableName}(`))
      .map(({ variableName }) => `${variableName}()`)
      .join(', ');
    const calls = newCalls
      ? `${existing}${existing ? ', ' : ''}${newCalls}`
      : existing;
    return imports.replace(integrationsPattern, `integrations: [${calls}]`);
  }

  const calls = bindings
    .map(({ variableName }) => `${variableName}()`)
    .join(', ');
  return imports.replace(
    /defineConfig\(\{/,
    `defineConfig({\n  integrations: [${calls}],`,
  );
}

function getPackageManager(
  tree: Tree,
  requested: Schema['packageManager'],
): 'pnpm' | 'npm' | 'yarn' | 'bun' {
  if (requested && requested !== 'auto') return requested;
  if (tree.exists('pnpm-lock.yaml')) return 'pnpm';
  if (tree.exists('yarn.lock')) return 'yarn';
  if (tree.exists('bun.lockb')) return 'bun';
  return 'npm';
}

/** Adds Astro integrations to the virtual tree and defers package installation. */
export default async function addIntegration(
  tree: Tree,
  options: Schema,
): Promise<GeneratorCallback | undefined> {
  const project = readProjectConfiguration(tree, options.project);
  const names = Array.from(
    new Set(options.names.map((name) => name.trim()).filter(Boolean)),
  );
  if (names.length === 0) {
    throw new Error('At least one integration name is required.');
  }

  const configCandidates = [
    'astro.config.ts',
    'astro.config.mjs',
    'astro.config.js',
  ];
  const configPath = configCandidates
    .map((fileName) => joinPathFragments(project.root, fileName))
    .find((filePath) => tree.exists(filePath));
  const targetConfigPath =
    configPath ?? joinPathFragments(project.root, 'astro.config.mjs');
  const currentConfig =
    tree.read(targetConfigPath, 'utf-8') ??
    `import { defineConfig } from 'astro/config';\n\nexport default defineConfig({});\n`;
  tree.write(targetConfigPath, updateAstroConfig(currentConfig, names));

  const packagePath = joinPathFragments(project.root, 'package.json');
  if (tree.exists(packagePath)) {
    updateJson(tree, packagePath, (packageJson) => {
      packageJson.dependencies ??= {};
      for (const name of names) {
        packageJson.dependencies[
          integrationPackages[name] ?? `@astrojs/${name}`
        ] ??= '^1.0.0';
      }
      return packageJson;
    });
  }

  await formatFiles(tree);

  if (options.skipInstall) return undefined;
  return () =>
    installPackagesTask(
      tree,
      true,
      project.root,
      getPackageManager(tree, options.packageManager),
    );
}
