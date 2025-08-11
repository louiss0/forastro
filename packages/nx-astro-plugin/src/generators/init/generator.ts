import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  updateJson,
  readJson,
  logger,
  addDependenciesToPackageJson,
  names,
} from '@nx/devkit';
import type { Tree } from '@nx/devkit';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import type { InitGeneratorSchema } from './schema';
import { getPackageManagerAddCommand } from '../../utils/package-manager';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface NormalizedSchema extends InitGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  _tree: Tree,
  options: InitGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;

  const projectName = projectDirectory.replace(/\//g, '-');
  const projectRoot = projectDirectory;
  const parsedTags = options.tags ? options.tags.split(',').map((s) => s.trim()) : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: new Array(options.projectRoot.split('/').length).fill('..').join('/'),
    template: '',
  };

  generateFiles(
    tree,
    join(__dirname, 'files'),
    options.projectRoot,
    templateOptions
  );
}

function updateNxJson(tree: Tree) {
  const nxJson = readJson(tree, 'nx.json');
  
  // Add Astro target defaults if they don't exist
  if (!nxJson.targetDefaults) {
    nxJson.targetDefaults = {};
  }

  // Add Astro-specific target defaults
  if (!nxJson.targetDefaults.dev) {
    nxJson.targetDefaults.dev = {
      executor: '@astro-nx/astro:dev',
      options: {},
    };
  }

  if (!nxJson.targetDefaults.build) {
    nxJson.targetDefaults.build = {
      executor: '@astro-nx/astro:build',
      outputs: ['{options.outputPath}'],
      options: {
        outputPath: 'dist/{projectRoot}',
      },
    };
  }

  if (!nxJson.targetDefaults.preview) {
    nxJson.targetDefaults.preview = {
      executor: '@astro-nx/astro:preview',
      options: {},
    };
  }

  updateJson(tree, 'nx.json', () => nxJson);
}


function addDependencies(tree: Tree, _options: NormalizedSchema) {
  const dependencies = {
    'astro': '^4.0.0',
  };

  const devDependencies = {
    '@types/node': '^20.0.0',
    'vite': '^5.0.0',
    'eslint': '^8.0.0',
    '@typescript-eslint/eslint-plugin': '^6.0.0',
    '@typescript-eslint/parser': '^6.0.0',
    'eslint-plugin-astro': '^0.29.0',
    'typescript': '^5.0.0',
  };

  return addDependenciesToPackageJson(tree, dependencies, devDependencies);
}

export default async function (tree: Tree, options: InitGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);

  // Add project configuration
  addProjectConfiguration(tree, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'application',
    sourceRoot: `${normalizedOptions.projectRoot}/src`,
    targets: {
      dev: {
        executor: '@astro-nx/astro:dev',
        options: {},
      },
      build: {
        executor: '@astro-nx/astro:build',
        options: {
          outputPath: `dist/${normalizedOptions.projectRoot}`,
        },
      },
      preview: {
        executor: '@astro-nx/astro:preview',
        options: {},
      },
      lint: {
        executor: '@nx/eslint:lint',
        outputs: ['{options.outputFile}'],
        options: {
          lintFilePatterns: [
            `${normalizedOptions.projectRoot}/**/*.{js,ts,astro}`,
          ],
        },
      },
      check: {
        executor: '@astro-nx/astro:check',
        options: {},
      },
    },
    tags: normalizedOptions.parsedTags,
  });

  // Add template files
  addFiles(tree, normalizedOptions);

  // Add dependencies
  addDependencies(tree, normalizedOptions);

  // Update nx.json with target defaults
  updateNxJson(tree);

  // Format files
  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  // Log completion message
  logger.info(`Astro project ${normalizedOptions.projectName} created successfully!`);
  
  if (normalizedOptions.packageManager) {
    const addCommand = getPackageManagerAddCommand(normalizedOptions.packageManager);
    logger.info(`Run '${addCommand}' to install dependencies.`);
  }
}
