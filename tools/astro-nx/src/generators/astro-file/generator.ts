import type {
  Tree,
  GeneratorCallback,
} from '@nx/devkit';
import {
  formatFiles,
  runTasksInSerial,
  names,
} from '@nx/devkit';
import { join } from 'path';
import componentGenerator from '../component/generator.js';
import pageGenerator from '../page/generator.js';
import type { ComponentGeneratorSchema } from '../component/generator.js';
import type { PageGeneratorSchema } from '../page/generator.js';
import { ensureTreeDirs } from '../../internal/fs/tree-io.js';

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
  
  // Validate options first
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
      (options as any).kind = 'page';
    } else {
      (options as any).kind = 'file';
    }
  }
  
  if (!options.name) {
    throw new Error('name is required');
  }
  if (!options.project && !options.bulk) {
    throw new Error('project is required when not in bulk mode');
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
      project: options.project!,
      directory: options.directory,
      props: options.props,
      ext: options.ext as 'astro' | 'mdx' | undefined,
      skipFormat: true, // We'll format at the end
    };
    
    return await componentGenerator(tree, componentOptions);
  } else if (options.kind === 'page') {
    const pageOptions: PageGeneratorSchema = {
      name: options.name,
      project: options.project!,
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
  const normalizedOptions = normalizeFileOptions(options);
  createAstroFile(tree, normalizedOptions);
}

function normalizeFileOptions(options: AstroFileGeneratorSchema) {
  const projectName = options.project;
  const projectRoot = `apps/${projectName}`;
  
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
    targetDirectory = join(projectRoot, 'src', options.destination);
  } else if (options.directory) {
    // Use directory option, default to pages if not specified
    targetDirectory = join(projectRoot, 'src', 'pages', options.directory);
  } else {
    // Default to pages directory
    targetDirectory = join(projectRoot, 'src', 'pages');
  }
  
  // Combine with name-based directory if present
  if (nameDirectory) {
    targetDirectory = join(targetDirectory, nameDirectory);
  }
  
  const fullFileName = `${fileName}.${ext}`;
  const filePath = join(targetDirectory, fullFileName);
  
  // Generate a readable title from the filename
  const title = convertPascalCaseToSpaced(names(fileName).className);
  
  return {
    ...options,
    projectName,
    projectRoot,
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
  tree.write(options.filePath, content);
}

function generateFileContent(options: ReturnType<typeof normalizeFileOptions>): string {
  const needsFrontmatter = options.ext === 'astro' || shouldIncludeFrontmatter(options);
  
  if (options.ext === 'astro') {
    return generateAstroContent(options, needsFrontmatter);
  } else {
    return generateMarkupContent(options, needsFrontmatter);
  }
}

function shouldIncludeFrontmatter(options: ReturnType<typeof normalizeFileOptions>): boolean {
  // Include frontmatter only when needed and not explicitly disabled
  if (options.minimalFrontmatter === false) {
    return false;
  }
  
  // For markup files, include frontmatter only if it adds value
  return ['md', 'mdx', 'adoc', 'mdoc'].includes(options.ext);
}

function generateAstroContent(options: ReturnType<typeof normalizeFileOptions>, includeFrontmatter: boolean): string {
  const frontmatter = includeFrontmatter ? generateMinimalFrontmatter(options) : '';
  
  const content = `${frontmatter ? frontmatter + '\n\n' : ''}<!-- ${options.title} -->
<div>
  <h1>${options.title}</h1>
  <p>Your Astro content goes here.</p>
</div>
`;
  
  return content;
}

function generateMarkupContent(options: ReturnType<typeof normalizeFileOptions>, includeFrontmatter: boolean): string {
  const frontmatter = includeFrontmatter ? generateMinimalFrontmatter(options) : '';
  
  let contentHeader: string;
  let contentBody: string;
  
  switch (options.ext) {
    case 'adoc':
      contentHeader = `= ${options.title}`;
      contentBody = 'Your AsciiDoc content goes here.';
      break;
    case 'mdx':
      contentHeader = `# ${options.title}`;
      contentBody = 'Your MDX content goes here.\n\nYou can use JSX components in this file!';
      break;
    case 'mdoc':
      contentHeader = `# ${options.title}`;
      contentBody = 'Your Markdoc content goes here.\n\nYou can use Markdoc tags and components!';
      break;
    case 'md':
    default:
      contentHeader = `# ${options.title}`;
      contentBody = 'Your content goes here.';
      break;
  }
  
  return `${frontmatter ? frontmatter + '\n\n' : ''}${contentHeader}\n\n${contentBody}\n`;
}

function generateMinimalFrontmatter(options: ReturnType<typeof normalizeFileOptions>): string {
  // Only include frontmatter when it adds meaningful value
  if (options.minimalFrontmatter === false) {
    return '';
  }
  
  const lines = ['---'];
  
  // Only add title if it's meaningful (not just a converted filename)
  if (options.title && options.title !== names(options.fileName).className) {
    lines.push(`title: '${options.title}'`);
  }
  
  lines.push('---');
  
  // Only return frontmatter if it contains more than just the delimiters
  return lines.length > 2 ? lines.join('\n') : '';
}

function convertPascalCaseToSpaced(pascalCase: string): string {
  return pascalCase
    // Insert space before uppercase letters (except at the start)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    // Handle consecutive capitals like "XMLHttp" -> "XML Http"
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim();
}
