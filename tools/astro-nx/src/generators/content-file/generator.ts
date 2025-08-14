import type {
  Tree,
  GeneratorCallback,
} from '@nx/devkit';
import { names, formatFiles, runTasksInSerial } from '@nx/devkit';
import { ensureTreeDirs } from '../../internal/fs/tree-io.js';
import { safeWriteFile } from '../../internal/fs/tree-ops.js';
import { getTemplateByExtension } from '../../internal/templates/index.js';
import { buildPath } from '../../internal/generate/paths.js';
import { getDefaultContentExt } from '../../internal/detect/project-type.js';
import { getProjectPaths } from '../../internal/detect/config.js';
import {
  validateNonEmptyString,
  validateProjectExists,
  validateEnum,
} from '../../internal/validate/options.js';
import {
  runGeneratorWorkflow,
  type BaseGeneratorOptions,
  type GeneratorWorkflowConfig,
  type NormalizedBaseOptions,
} from '../../internal/generate/workflow.js';

export interface ContentFileGeneratorSchema {
  name: string;
  project: string;
  collection?: string;
  directory?: string;
  title?: string;
  description?: string;
  author?: string;
  tags?: string[];
  date?: string;
  draft?: boolean;
  ext?: 'md' | 'mdx' | 'mdoc' | 'adoc';
  frontmatter?: Record<string, unknown>;
  skipFormat?: boolean;
  // Allow additional properties for direct frontmatter assignment
  [key: string]: unknown;
}

export default async function (tree: Tree, options: ContentFileGeneratorSchema) {
  const tasks: GeneratorCallback[] = [];
  
  // Apply standardized validations first
  validateNonEmptyString(options.name, 'name');
  validateNonEmptyString(options.project, 'project');
  validateProjectExists(tree, options.project);
  validateEnum(options.ext, ['md', 'mdx', 'mdoc', 'adoc'] as const, 'ext');
  
  const normalizedOptions = normalizeOptions(tree, options);
  addFiles(tree, normalizedOptions);
  
  if (!options.skipFormat) {
    await formatFiles(tree);
  }
  
  return runTasksInSerial(...tasks);
}

function normalizeOptions(tree: Tree, options: ContentFileGeneratorSchema) {
  const name = names(options.name).fileName;
  const className = names(options.name).className;
  const projectName = options.project;
  
  // Get project paths using Nx configuration - eliminates hardcoded 'apps/' assumption
  const projectPaths = getProjectPaths(tree, projectName);
  
  // Use extension detection based on package.json or default to md
  let ext: string;
  if (options.ext) {
    ext = options.ext;
  } else {
    const defaultExt = getDefaultContentExt(projectPaths.root);
    // Remove the dot from the extension returned by getDefaultContentExt
    ext = defaultExt.startsWith('.') ? defaultExt.slice(1) : defaultExt;
  }
  
  // Determine file path - simplified logic
  let targetDir: string;
  
  if (options.collection) {
    // Use content collections structure
    targetDir = buildPath(projectPaths.contentDir, options.collection);
  } else if (options.directory) {
    // Use custom directory - build relative to project root
    targetDir = buildPath(projectPaths.root, options.directory);
  } else {
    // Default fallback - use src/content
    targetDir = projectPaths.contentDir;
  }
  
  // Determine title from provided title or derive from name
  const title = options.title || names(options.name).className.replace(/([A-Z])/g, ' $1').trim();
  
  // Extract frontmatter fields from schema and options
  const frontmatterData: Record<string, unknown> = {
    title,
    ...(options.description && { description: options.description }),
    ...(options.author && { author: options.author }),
    ...(options.tags && { tags: options.tags }),
    ...(options.date && { date: options.date }),
    ...(options.draft !== undefined && { draft: options.draft }),
    ...options.frontmatter
  };
  
  // Create frontmatter presets based on file extension
  const frontmatterPreset = getFrontmatterPreset(ext, frontmatterData);
  
  return {
    ...options,
    name,
    className,
    projectName,
    projectRoot: projectPaths.root,
    ext,
    targetDir,
    frontmatter: frontmatterPreset,
    tmpl: '',
  };
}


function getFrontmatterPreset(ext: string, customFrontmatter?: Record<string, unknown>): Record<string, unknown> {
  // Always include at least a title - this is the minimum requirement
  const basePreset: Record<string, unknown> = {
    title: customFrontmatter?.['title'] || 'Untitled',
  };
  
  let extendedPreset: Record<string, unknown> = { ...basePreset };
  
  switch (ext) {
    case 'md':
    case 'mdx':
      extendedPreset = {
        ...basePreset,
        description: '',
        pubDate: new Date().toISOString().split('T')[0],
        author: '',
        tags: [],
        draft: false,
      };
      break;
    case 'adoc':
      extendedPreset = {
        ...basePreset,
        description: '',
        pubDate: new Date().toISOString().split('T')[0],
        author: '',
        keywords: [],
        doctitle: customFrontmatter?.['title'] || 'Untitled',
      };
      break;
    case 'mdoc':
      extendedPreset = {
        ...basePreset,
        description: '',
        pubDate: new Date().toISOString().split('T')[0],
        author: '',
        tags: [],
      };
      break;
    default:
      // For any other extension, ensure we have at least a title
      extendedPreset = { ...basePreset };
      break;
  }
  
  // Merge with custom frontmatter if provided, but always preserve title
  if (customFrontmatter) {
    extendedPreset = { ...extendedPreset, ...customFrontmatter };
  }
  
  return extendedPreset;
}

function addFiles(tree: Tree, options: ReturnType<typeof normalizeOptions>) {
  // Prepare template options
  const templateOptions = {
    title: options.frontmatter['title'] as string,
    description: options.frontmatter['description'] as string,
    author: options.frontmatter['author'] as string,
    tags: options.frontmatter['tags'] as string[],
    pubDate: options.frontmatter['pubDate'] as string,
    frontmatter: options.frontmatter,
    className: options.className
  };
  
  // Generate content using in-memory templates
  const content = getTemplateByExtension(options.ext, templateOptions);
  const targetPath = buildPath(options.targetDir, `${options.name}.${options.ext}`);
  
  // Ensure the target directory exists using helper
  ensureTreeDirs(tree, options.targetDir);
  
  // Create the content file
  safeWriteFile(tree, targetPath, content);
}




