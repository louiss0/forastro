import type {
  Tree,
  GeneratorCallback,
} from '@nx/devkit';
import { names } from '@nx/devkit';
import { readAstroConfig } from '../../internal/detect/config';
import { ensureTreeDirs } from '../../internal/fs/tree-io.js';
import { safeWriteFile } from '../../internal/fs/tree-ops.js';
import { getTemplateByExtension } from '../../internal/templates/index.js';
import { buildPath, getProjectPaths } from '../../internal/generate/paths.js';
import {
  runGeneratorWorkflow,
  type BaseGeneratorOptions,
  type GeneratorWorkflowConfig,
  type NormalizedBaseOptions,
  parseNestedName,
  combineDirectories,
} from '../../internal/generate/workflow.js';

export interface PageGeneratorSchema extends BaseGeneratorOptions {
  ext?: 'astro' | 'md' | 'adoc' | 'mdx' | 'mdoc';
  layout?: string;
  title?: string;
  description?: string;
  frontmatter?: Record<string, unknown>;
}

export default async function (tree: Tree, options: PageGeneratorSchema): Promise<GeneratorCallback> {
  const config: GeneratorWorkflowConfig<PageGeneratorSchema> = {
    validation: {
      enumFields: [
        { field: 'ext', allowedValues: ['astro', 'md', 'adoc', 'mdx', 'mdoc'] },
      ],
    },
    pathResolution: {
      targetType: 'pages',
      extension: options.ext || 'astro',
      customPathResolver: (opts, normalizedBase) => {
        // Handle nested route names like "blog/[slug]"
        const { fileName, nameDirectory } = parseNestedName(opts.name);
        const combinedDirectory = combineDirectories(opts.directory, nameDirectory);
        
        const baseDir = normalizedBase.projectPaths.pagesDir;
        const targetDir = combinedDirectory ? buildPath(baseDir, combinedDirectory) : baseDir;
        const fullFileName = `${fileName}.${opts.ext || 'astro'}`;
        
        return buildPath(targetDir, fullFileName);
      },
    },
    generate: generatePage,
  };

  return runGeneratorWorkflow(tree, options, config);
}

function generatePage(
  tree: Tree,
  options: PageGeneratorSchema & NormalizedBaseOptions,
  targetPath: string
): void {
  // Parse the name to get the actual filename
  const { fileName } = parseNestedName(options.name);
  
  // Check if this is a dynamic page based on filename containing brackets
  const isDynamic = fileName.includes('[') && fileName.includes(']');
  
  // Read Astro configuration for defaults
  const detectedConfig = readAstroConfig(options.projectPaths.root);
  
  // Resolve layout import path if layout is specified
  let layoutImportPath: string | undefined;
  if (options.layout) {
    const pathSegments = targetPath.split('/');
    const targetDir = pathSegments.slice(0, -1).join('/');
    const layoutResolution = resolveLayoutImport(tree, options.projectName, options.layout, targetDir);
    layoutImportPath = layoutResolution?.importPath;
  }
  
  // Generate title - priority: provided title > frontmatter title > derived from name
  const title = options.title || options.frontmatter?.['title'] || convertPascalCaseToSpaced(names(fileName).className);
  
  // Prepare template options
  const templateOptions = {
    title,
    description: options.description,
    layout: options.layout,
    layoutImportPath,
    frontmatter: options.frontmatter || {},
    isPage: true,
    isDynamic
  };
  
  // Generate content using in-memory templates
  const content = getTemplateByExtension(options.ext || 'astro', templateOptions);
  
  // Extract target directory from path
  const pathSegments = targetPath.split('/');
  const targetDir = pathSegments.slice(0, -1).join('/');
  
  // Ensure target directory exists
  ensureTreeDirs(tree, targetDir);
  
  // Write the processed content to the tree
  safeWriteFile(tree, targetPath, content);
}

/**
 * Resolve layout import path by probing existing files
 * Priority: layouts/ directory, then components/ directory
 */
function resolveLayoutImport(tree: Tree, projectName: string, layoutName: string, currentDir: string): { importPath: string; resolvedPath: string } | null {
  if (!layoutName) {
    return null;
  }

  const projectPaths = getProjectPaths(tree, projectName);
  
  // Try layouts directory first
  const layoutsPath = buildPath(projectPaths.layoutsDir, `${layoutName}.astro`);
  if (tree.exists(layoutsPath)) {
    // Calculate relative path from current directory to layouts directory
    const relativePath = calculateRelativePath(currentDir, projectPaths.layoutsDir);
    return {
      importPath: buildPath(relativePath, `${layoutName}.astro`),
      resolvedPath: layoutsPath
    };
  }
  
  // Try components directory as fallback
  const componentsPath = buildPath(projectPaths.componentsDir, `${layoutName}.astro`);
  if (tree.exists(componentsPath)) {
    // Calculate relative path from current directory to components directory
    const relativePath = calculateRelativePath(currentDir, projectPaths.componentsDir);
    return {
      importPath: buildPath(relativePath, `${layoutName}.astro`),
      resolvedPath: componentsPath
    };
  }
  
  // If layout doesn't exist, return default path (layouts directory)
  const relativePath = calculateRelativePath(currentDir, projectPaths.layoutsDir);
  return {
    importPath: buildPath(relativePath, `${layoutName}.astro`),
    resolvedPath: layoutsPath
  };
}

/**
 * Calculate relative path from source directory to target directory
 */
function calculateRelativePath(from: string, to: string): string {
  // Simple relative path calculation
  const fromParts = from.split('/');
  const toParts = to.split('/');
  
  // Find common base
  let commonLength = 0;
  while (commonLength < fromParts.length && commonLength < toParts.length && fromParts[commonLength] === toParts[commonLength]) {
    commonLength++;
  }
  
  // Calculate path
  const upDirs = fromParts.length - commonLength;
  const relativeParts = [];
  
  // Go up directories
  for (let i = 0; i < upDirs; i++) {
    relativeParts.push('..');
  }
  
  // Add remaining target path parts
  relativeParts.push(...toParts.slice(commonLength));
  
  return relativeParts.join('/');
}

function convertPascalCaseToSpaced(pascalCase: string): string {
  return pascalCase
    // Insert space before uppercase letters (except at the start)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    // Handle consecutive capitals like "XMLHttp" -> "XML Http"
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim();
}



