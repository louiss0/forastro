import type {
  Tree,
  GeneratorCallback,
} from '@nx/devkit';
import {
  formatFiles,
  runTasksInSerial,
  names,
} from '@nx/devkit';
import componentGenerator from '../component/generator.js';
import pageGenerator from '../page/generator.js';
import type { ComponentGeneratorSchema } from '../component/generator.js';
import type { PageGeneratorSchema } from '../page/generator.js';
import { ensureTreeDirs } from '../../internal/fs/tree-io.js';
import { safeWriteFile } from '../../internal/fs/tree-ops.js';
import { astroFileTemplate } from '../../internal/templates/index.js';
import { getProjectPaths, buildPath } from '../../internal/generate/paths.js';
import { validateNonEmptyString, validateProjectExists, validateEnum } from '../../internal/validate/options.js';

export interface AstroFileGeneratorSchema {
  kind?: 'page' | 'component' | 'file';
  name: string;
  project: string;
  directory?: string;
  destination?: string; // Relative path under src/
  ext?: 'astro' | 'md' | 'adoc' | 'mdx' | 'mdoc';
  props?: string;
  bulk?: boolean;
  projects?: string[];
  skipFormat?: boolean;
  minimalFrontmatter?: boolean;
}

export default async function (tree: Tree, options: AstroFileGeneratorSchema) {
  const tasks: GeneratorCallback[] = [];
  
  // Apply standardized validations first
  validateNonEmptyString(options.name, 'name');
  if (!options.bulk) {
    validateNonEmptyString(options.project, 'project');
    validateProjectExists(tree, options.project);
  }
  validateEnum(options.kind, ['page', 'component', 'file'] as const, 'kind');
  validateEnum(options.ext, ['astro', 'md', 'adoc', 'mdx', 'mdoc'] as const, 'ext');
  
  // Validate options
  validateOptions(options);
  
  if (options.bulk && options.projects) {
    // Bulk mode: iterate through selected projects
    for (const projectName of options.projects) {
      const projectOptions = {
        ...options,
        project: projectName,
        bulk: false, // Prevent infinite recursion
        projects: undefined,
      };
      
      const task = await delegateToGenerator(tree, projectOptions);
      if (task) {
        tasks.push(task);
      }
    }
  } else {
    // Single project mode
    const task = await delegateToGenerator(tree, options);
    if (task) {
      tasks.push(task);
    }
  }
  
  // Format files at the end if not skipped
  if (!options.skipFormat) {
    await formatFiles(tree);
  }
  
  return runTasksInSerial(...tasks);
}

function validateOptions(options: AstroFileGeneratorSchema): void {
  // Set default kind if not provided
  if (!options.kind) {
    // Default to 'page' if destination indicates pages, otherwise 'file'
    if (options.destination && options.destination.includes('pages')) {
      (options as { kind: string }).kind = 'page';
    } else {
      (options as { kind: string }).kind = 'file';
    }
  }
  
  // Validate bulk mode requirements
  if (options.bulk && (!options.projects || options.projects.length === 0)) {
    throw new Error('projects array is required when bulk=true');
  }
  
  // Validate kind-specific requirements
  if (options.kind === 'component' && options.props) {
    // Props are only valid for components, this is fine
  }
  if ((options.kind === 'page' || options.kind === 'file') && options.props) {
    console.warn('Warning: props parameter is ignored for pages and files');
  }
}

async function delegateToGenerator(tree: Tree, options: AstroFileGeneratorSchema): Promise<GeneratorCallback | null> {
  if (options.kind === 'component') {
    const componentOptions: ComponentGeneratorSchema = {
      name: options.name,
      project: options.project || '',
      directory: options.directory,
      props: options.props,
      ext: options.ext as 'astro' | 'mdx' | undefined,
      skipFormat: true, // We'll format at the end
    };
    
    return await componentGenerator(tree, componentOptions);
  } else if (options.kind === 'page') {
    const pageOptions: PageGeneratorSchema = {
      name: options.name,
      project: options.project || '',
      directory: options.directory,
      ext: options.ext,
      skipFormat: true, // We'll format at the end
    };
    
    return await pageGenerator(tree, pageOptions);
  } else if (options.kind === 'file') {
    // Handle arbitrary file creation
    generateAstroFile(tree, options);
  }
  
  return null;
}

function generateAstroFile(tree: Tree, options: AstroFileGeneratorSchema): void {
  const normalizedOptions = normalizeFileOptions(tree, options);
  createAstroFile(tree, normalizedOptions);
}

function normalizeFileOptions(tree: Tree, options: AstroFileGeneratorSchema) {
  const projectName = options.project;
  
  // Get project paths using Nx configuration - eliminates hardcoded 'apps/' assumption
  const projectPaths = getProjectPaths(tree, projectName);
  
  // Determine the extension (default to .astro)
  const ext = options.ext || 'astro';
  
  // Handle nested file names like "layouts/base"
  const nameParts = options.name.split('/');
  const fileName = nameParts[nameParts.length - 1];
  const nameDirectory = nameParts.length > 1 ? nameParts.slice(0, -1).join('/') : '';
  
  // Determine the target directory
  let targetDirectory: string;
  if (options.destination) {
    // Use provided destination relative to src
    targetDirectory = buildPath(projectPaths.srcRoot, options.destination);
  } else if (options.directory) {
    // Use directory option, default to pages if not specified
    targetDirectory = buildPath(projectPaths.pagesDir, options.directory);
  } else {
    // Default to pages directory
    targetDirectory = projectPaths.pagesDir;
  }
  
  // Combine with name-based directory if present
  if (nameDirectory) {
    targetDirectory = buildPath(targetDirectory, nameDirectory);
  }
  
  const fullFileName = `${fileName}.${ext}`;
  const filePath = buildPath(targetDirectory, fullFileName);
  
  // Generate a readable title from the filename
  const title = convertPascalCaseToSpaced(names(fileName).className);
  
  return {
    ...options,
    projectName,
    projectRoot: projectPaths.root,
    targetDirectory,
    fileName,
    fullFileName,
    filePath,
    ext,
    title,
  };
}

function createAstroFile(tree: Tree, options: ReturnType<typeof normalizeFileOptions>): void {
  // Ensure target directory exists using helper
  ensureTreeDirs(tree, options.targetDirectory);
  
  // Generate content based on extension
  const content = generateFileContent(options);
  
  // Write the file
  safeWriteFile(tree, options.filePath, content);
}

function generateFileContent(options: ReturnType<typeof normalizeFileOptions>): string {
  const templateOptions = {
    title: options.title,
    ext: options.ext,
    isPage: false,
    minimalFrontmatter: options.minimalFrontmatter !== false
  };
  
  return astroFileTemplate(templateOptions);
}





function convertPascalCaseToSpaced(pascalCase: string): string {
  return pascalCase
    // Insert space before uppercase letters (except at the start)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    // Handle consecutive capitals like "XMLHttp" -> "XML Http"
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim();
}
