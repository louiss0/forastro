import {
  formatFiles,
  readJson,
  joinPathFragments,
  logger,
  writeJson,
  names,
} from '@nx/devkit';
import type { Tree } from '@nx/devkit';
import type { MigrateGeneratorSchema } from './schema';

interface NormalizedSchema extends MigrateGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
}

function normalizeOptions(
  _tree: Tree,
  options: MigrateGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory || name;
  const projectName = projectDirectory.replace(/\//g, '-');
  const projectRoot = projectDirectory;

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
  };
}

function detectAstroRoot(tree: Tree, projectRoot: string): boolean {
  const packageJsonPath = joinPathFragments(projectRoot, 'package.json');
  const astroConfigPath = joinPathFragments(projectRoot, 'astro.config.mjs');
  const astroConfigTsPath = joinPathFragments(projectRoot, 'astro.config.ts');
  const astroConfigJsPath = joinPathFragments(projectRoot, 'astro.config.js');

  // Check if package.json exists
  if (!tree.exists(packageJsonPath)) {
    return false;
  }

  // Check if astro config exists
  const hasAstroConfig = tree.exists(astroConfigPath) || 
                        tree.exists(astroConfigTsPath) || 
                        tree.exists(astroConfigJsPath);

  if (!hasAstroConfig) {
    return false;
  }

  // Check if astro is in dependencies
  const packageJson = readJson(tree, packageJsonPath);
  const hasAstroDependency = 
    (packageJson.dependencies && packageJson.dependencies.astro) ||
    (packageJson.devDependencies && packageJson.devDependencies.astro);

  return hasAstroDependency;
}

function createProjectJson(tree: Tree, options: NormalizedSchema, packageJson: any) {
  const projectJsonPath = joinPathFragments(options.projectRoot, 'project.json');
  
  // Base project configuration
  const projectConfig = {
    name: options.projectName,
    root: options.projectRoot,
    projectType: 'application',
    sourceRoot: `${options.projectRoot}/src`,
    targets: {
      dev: {
        executor: '@astro-nx/astro:dev',
        options: {},
      },
      build: {
        executor: '@astro-nx/astro:build',
        options: {
          outputPath: `dist/${options.projectRoot}`,
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
            `${options.projectRoot}/**/*.{js,ts,astro}`,
          ],
        },
      },
    },
  };

  // Convert existing scripts to Nx targets if requested
  if (options.convertScripts && packageJson.scripts) {
    const convertedTargets = Object.keys(packageJson.scripts).reduce((acc: Record<string, any>, scriptName) => {
      // Skip scripts that are already defined as Nx targets
      if (!(scriptName in projectConfig.targets)) {
        const command = packageJson.scripts[scriptName];
        
        // Use default Nx executor for run-commands
        const executor = '@nx/workspace:run-commands';
        
        acc[scriptName] = {
          executor,
          options: {
            command,
          },
        };
      }
      return acc;
    }, {});

    // Merge converted targets
    projectConfig.targets = { ...projectConfig.targets, ...convertedTargets };
  }

  writeJson(tree, projectJsonPath, projectConfig);
  return projectConfig;
}

function promptForScriptConversion(packageJson: any): boolean {
  if (!packageJson.scripts || Object.keys(packageJson.scripts).length === 0) {
    return false;
  }

  logger.info('\n📋 Found the following scripts in package.json:');
  Object.keys(packageJson.scripts).forEach(script => {
    logger.info(`  - ${script}: ${packageJson.scripts[script]}`);
  });
  
  logger.info('\n🔄 These scripts will be converted to Nx targets.');
  logger.info('You can disable this by using --convertScripts=false');
  
  return true;
}

export default async function (tree: Tree, options: MigrateGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);
  const packageJsonPath = joinPathFragments(normalizedOptions.projectRoot, 'package.json');

  // Detect Astro root
  if (!detectAstroRoot(tree, normalizedOptions.projectRoot)) {
    throw new Error(
      `Cannot detect Astro project in ${normalizedOptions.projectRoot}. ` +
      `Please ensure the directory contains a valid Astro project with astro.config.* file and astro dependency.`
    );
  }

  logger.info(`✅ Detected Astro project in ${normalizedOptions.projectRoot}`);

  // Read package.json
  const packageJson = readJson(tree, packageJsonPath);

  // Ask about script conversion (if enabled)
  if (options.convertScripts) {
    promptForScriptConversion(packageJson);
  }

  // Create project.json with correctly wired targets
  const projectConfig = createProjectJson(tree, normalizedOptions, packageJson);

  logger.info(`📄 Created project.json with ${Object.keys(projectConfig.targets).length} targets`);


  // Format files if necessary
  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  // Final success message
  logger.info(`\n🎉 Successfully migrated Astro project '${normalizedOptions.projectName}' to Nx!`);
  logger.info(`\n📍 Project location: ${normalizedOptions.projectRoot}`);
  logger.info(`\n🎯 Available targets:`);
  Object.keys(projectConfig.targets).forEach(target => {
    logger.info(`  - nx run ${normalizedOptions.projectName}:${target}`);
  });
}
