import type {
  Tree,
  GeneratorCallback,
} from '@nx/devkit';
import {
  formatFiles,
  names,
  runTasksInSerial,
  readProjectConfiguration,
} from '@nx/devkit';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { hasContentCollections, readAstroConfig } from '../../internal/detect/config';
import { ensureTreeDirs } from '../../internal/fs/tree-io.js';

export interface ContentFileGeneratorSchema {
  name: string;
  project: string;
  collection?: string;
  directory?: string;
  title?: string;
  ext?: 'md' | 'mdx' | 'mdoc' | 'adoc';
  frontmatter?: Record<string, any>;
  skipFormat?: boolean;
}

export default async function (tree: Tree, options: ContentFileGeneratorSchema) {
  const tasks: GeneratorCallback[] = [];
  
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
  
  // Read project configuration to get the actual project root
  const projectConfig = readProjectConfiguration(tree, projectName);
  const projectRoot = projectConfig.root;
  
  // Read Astro configuration for defaults
  const detectedConfig = readAstroConfig(projectRoot);
  
  // Detect if project has content collections
  const hasContentColls = hasContentCollections(projectRoot);
  
  // Determine the extension - check package.json dependencies first, then fallback to config
  let ext = options.ext;
  if (!ext) {
    ext = detectExtensionFromPackageJson(projectRoot, detectedConfig);
  }
  
  // Determine file path based on content collections vs directory
  let filePath: string;
  let targetDir: string;
  
  if (hasContentColls && options.collection) {
    // Use content collections structure
    targetDir = join(detectedConfig.contentDir || 'src/content', options.collection);
    filePath = join(projectRoot, targetDir, `${name}.${ext}`);
  } else if (options.directory) {
    // Use custom directory
    targetDir = options.directory;
    filePath = join(projectRoot, targetDir, `${name}.${ext}`);
  } else {
    // Default fallback - use detected content directory or create under src/content
    const contentBase = detectedConfig.contentDir || 'src/content';
    targetDir = contentBase;
    filePath = join(projectRoot, targetDir, `${name}.${ext}`);
  }
  
  // Determine title from provided title or derive from name
  const title = options.title || names(options.name).className.replace(/([A-Z])/g, ' $1').trim();
  
  // Create frontmatter presets based on file extension and detected config
  const frontmatterPreset = getFrontmatterPreset(ext, { title, ...options.frontmatter }, detectedConfig);
  
  return {
    ...options,
    name,
    className,
    projectName,
    projectRoot,
    ext,
    targetDir,
    filePath,
    hasContentCollections: hasContentColls,
    detectedConfig,
    frontmatter: frontmatterPreset,
    tmpl: '',
  };
}

/**
 * Detects the appropriate file extension by reading package.json dependencies
 * @param projectRoot - The root path of the project
 * @param detectedConfig - The detected Astro config as fallback
 * @returns The appropriate file extension
 */
function detectExtensionFromPackageJson(projectRoot: string, detectedConfig: any): 'md' | 'mdx' | 'mdoc' | 'adoc' {
  const packageJsonPath = join(projectRoot, 'package.json');
  
  if (existsSync(packageJsonPath)) {
    try {
      const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);
      
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Check for MDX integration
      if (dependencies['@astrojs/mdx'] || dependencies['mdx']) {
        return 'mdx';
      }
      
      // Check for other integrations
      if (dependencies['@astrojs/markdoc']) {
        return 'mdoc';
      }
      
      if (dependencies['@astrojs/asciidoc']) {
        return 'adoc';
      }
    } catch (error) {
      // If we can't read package.json, fall back to config detection
    }
  }
  
  // Fallback to detected config integrations
  if (detectedConfig.integrations?.includes('mdx')) {
    return 'mdx';
  } else if (detectedConfig.integrations?.includes('markdoc')) {
    return 'mdoc';
  } else if (detectedConfig.integrations?.includes('asciidoc')) {
    return 'adoc';
  }
  
  // Default to markdown
  return 'md';
}

function getFrontmatterPreset(ext: string, customFrontmatter?: Record<string, any>, _detectedConfig?: any): Record<string, any> {
  // Always include at least a title - this is the minimum requirement
  const basePreset: Record<string, any> = {
    title: customFrontmatter?.['title'] || 'Untitled',
  };
  
  let extendedPreset: Record<string, any> = { ...basePreset };
  
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
  const content = generateContentByExtension(options.ext, options);
  const targetPath = join(options.projectRoot, options.targetDir, `${options.name}.${options.ext}`);
  
  // Ensure the target directory exists using helper
  const targetDirPath = join(options.projectRoot, options.targetDir);
  ensureTreeDirs(tree, targetDirPath);
  
  // Create the content file
  tree.write(targetPath, content);
}

function generateContentByExtension(ext: string, options: ReturnType<typeof normalizeOptions>): string {
  const { frontmatter, className } = options;
  
  switch (ext) {
    case 'md':
    case 'mdx':
      return generateMarkdownContent(frontmatter, className, ext === 'mdx');
    case 'adoc':
      return generateAsciidocContent(frontmatter, className);
    case 'mdoc':
      return generateMarkdocContent(frontmatter, className);
    default:
      return generateMarkdownContent(frontmatter, className, false);
  }
}

function generateMarkdownContent(frontmatter: Record<string, any>, className: string, isMdx: boolean): string {
  let content = '---\n';
  
  // Always include title first
  content += `title: ${frontmatter['title'] || className}\n`;
  
  // Generate other frontmatter (excluding title since we already handled it)
  Object.entries(frontmatter).forEach(([key, value]) => {
    if (key === 'title') return; // Skip title as we already handled it
    
    if (value !== '' && value != null) {
      if (typeof value === 'string') {
        content += `${key}: ${value}\n`;
      } else if (Array.isArray(value) && value.length > 0) {
        const arrayItems = value.map(item => typeof item === 'string' ? item : String(item)).join(', ');
        content += `${key}: [${arrayItems}]\n`;
      } else if (typeof value === 'boolean' || typeof value === 'number') {
        content += `${key}: ${value}\n`;
      } else {
        content += `${key}: ${value}\n`;
      }
    }
  });
  
  content += '---\n\n';
  content += `# ${frontmatter['title'] || className}\n\n`;
  content += `${frontmatter['description'] || `Content for ${className}`}\n\n`;
  content += 'Write your content here...\n';
  
  if (isMdx) {
    content += '\n{/* Example JSX component usage */}\n';
    content += '{/* <CustomComponent prop="value" /> */}\n';
  }
  
  return content;
}

function generateAsciidocContent(frontmatter: Record<string, any>, className: string): string {
  let content = '';
  
  // Always include title first as AsciiDoc attribute
  content += `:title: ${frontmatter['title'] || className}\n`;
  
  // Generate other AsciiDoc attributes (excluding title since we already handled it)
  Object.entries(frontmatter).forEach(([key, value]) => {
    if (key === 'title') return; // Skip title as we already handled it
    
    if (value !== '' && value != null) {
      if (Array.isArray(value) && value.length > 0) {
        content += `:${key}: ${value.join(', ')}\n`;
      } else {
        content += `:${key}: ${value}\n`;
      }
    }
  });
  
  content += '\n';
  content += `= ${frontmatter['title'] || frontmatter['doctitle'] || className}\n\n`;
  content += `${frontmatter['description'] || `Content for ${className}`}\n\n`;
  content += 'Write your AsciiDoc content here...\n\n';
  content += '== Section Example\n\n';
  content += 'This is an example section in AsciiDoc format.\n';
  
  return content;
}

function generateMarkdocContent(frontmatter: Record<string, any>, className: string): string {
  let content = '---\n';
  
  // Always include title first
  content += `title: ${frontmatter['title'] || className}\n`;
  
  // Generate other frontmatter (excluding title since we already handled it)
  Object.entries(frontmatter).forEach(([key, value]) => {
    if (key === 'title') return; // Skip title as we already handled it
    
    if (value !== '' && value != null) {
      if (typeof value === 'string') {
        content += `${key}: ${value}\n`;
      } else if (Array.isArray(value) && value.length > 0) {
        const arrayItems = value.map(item => typeof item === 'string' ? item : String(item)).join(', ');
        content += `${key}: [${arrayItems}]\n`;
      } else if (typeof value === 'boolean' || typeof value === 'number') {
        content += `${key}: ${value}\n`;
      } else {
        content += `${key}: ${value}\n`;
      }
    }
  });
  
  content += '---\n\n';
  content += `# ${frontmatter['title'] || className}\n\n`;
  content += `${frontmatter['description'] || `Content for ${className}`}\n\n`;
  content += 'Write your Markdoc content here...\n\n';
  content += '{% callout type="note" %}\n';
  content += 'This is an example Markdoc callout.\n';
  content += '{% /callout %}\n';
  
  return content;
}
