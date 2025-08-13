import type {
  Tree,
  GeneratorCallback,
} from '@nx/devkit';
import {
  formatFiles,
  names,
  runTasksInSerial,
} from '@nx/devkit';
import { join } from 'path';
import { ensureTreeDirs } from '../../internal/fs/tree-io.js';

export interface ContentFileGeneratorSchema {
  name: string;
  project: string;
  collection?: string;
  directory?: string;
  title?: string;
  ext?: 'md' | 'mdx' | 'mdoc' | 'adoc';
  frontmatter?: Record<string, unknown>;
  skipFormat?: boolean;
  // Allow additional properties for direct frontmatter assignment
  [key: string]: unknown;
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
  
  // Use hardcoded project root pattern (following component generator pattern)
  const projectRoot = `apps/${projectName}`;
  
  // Use extension detection based on package.json or default to md
  const ext = options.ext || detectExtensionFromDependencies(tree, projectRoot);
  
  // Determine file path - simplified logic
  let targetDir: string;
  
  if (options.collection) {
    // Use content collections structure
    targetDir = join('src/content', options.collection);
  } else if (options.directory) {
    // Use custom directory
    targetDir = options.directory;
  } else {
    // Default fallback - use src/content
    targetDir = 'src/content';
  }
  
  // Determine title from provided title or derive from name
  const title = options.title || names(options.name).className.replace(/([A-Z])/g, ' $1').trim();
  
  // Extract custom frontmatter from options (excluding the known generator options)
  const knownOptions = ['name', 'project', 'collection', 'directory', 'title', 'ext', 'frontmatter', 'skipFormat'];
  const customFrontmatter: Record<string, unknown> = {};
  
  // Extract any additional properties as frontmatter
  Object.keys(options).forEach(key => {
    if (!knownOptions.includes(key)) {
      customFrontmatter[key] = options[key];
    }
  });
  
  // Create frontmatter presets based on file extension
  const frontmatterPreset = getFrontmatterPreset(ext, { title, ...customFrontmatter, ...options.frontmatter });
  
  return {
    ...options,
    name,
    className,
    projectName,
    projectRoot,
    ext,
    targetDir,
    frontmatter: frontmatterPreset,
    tmpl: '',
  };
}

function detectExtensionFromDependencies(tree: Tree, projectRoot: string): 'md' | 'mdx' | 'mdoc' | 'adoc' {
  const packageJsonPath = join(projectRoot, 'package.json');
  
  if (tree.exists(packageJsonPath)) {
    try {
      const packageJsonContent = tree.read(packageJsonPath, 'utf-8');
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
      
      if (dependencies['@astrojs/asciidoc'] || dependencies['astro-asciidoc']) {
        return 'adoc';
      }
    } catch {
      // If we can't read package.json, fall back to markdown
    }
  }
  
  // Default to markdown
  return 'md';
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

function generateMarkdownContent(frontmatter: Record<string, unknown>, className: string, isMdx: boolean): string {
  let content = '---\n';
  
  // Always include title first
  content += `title: ${frontmatter['title'] || className}\n`;
  
  // Generate other frontmatter (excluding title since we already handled it)
  Object.entries(frontmatter).forEach(([key, value]) => {
    if (key === 'title') return; // Skip title as we already handled it
    
    // Include all values except null and undefined
    if (value !== null && value !== undefined) {
      if (typeof value === 'string') {
        content += `${key}: ${value}\n`;
      } else if (Array.isArray(value) && value.length > 0) {
        const arrayItems = value.map(item => typeof item === 'string' ? item : String(item)).join(', ');
        content += `${key}: [${arrayItems}]\n`;
      } else if (typeof value === 'boolean' || typeof value === 'number') {
        content += `${key}: ${value}\n`;
      } else if (Array.isArray(value)) {
        // Handle empty arrays
        content += `${key}: []\n`;
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

function generateAsciidocContent(frontmatter: Record<string, unknown>, className: string): string {
  let content = '';
  
  // Always include title first as AsciiDoc attribute
  content += `:title: ${frontmatter['title'] || className}\n`;
  
  // Generate other AsciiDoc attributes (excluding title since we already handled it)
  Object.entries(frontmatter).forEach(([key, value]) => {
    if (key === 'title') return; // Skip title as we already handled it
    
    // Include all values except null and undefined
    if (value !== null && value !== undefined) {
      if (Array.isArray(value) && value.length > 0) {
        content += `:${key}: ${value.join(', ')}\n`;
      } else if (Array.isArray(value)) {
        // Handle empty arrays
        content += `:${key}:\n`;
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

function generateMarkdocContent(frontmatter: Record<string, unknown>, className: string): string {
  let content = '---\n';
  
  // Always include title first
  content += `title: ${frontmatter['title'] || className}\n`;
  
  // Generate other frontmatter (excluding title since we already handled it)
  Object.entries(frontmatter).forEach(([key, value]) => {
    if (key === 'title') return; // Skip title as we already handled it
    
    // Include all values except null and undefined
    if (value !== null && value !== undefined) {
      if (typeof value === 'string') {
        content += `${key}: ${value}\n`;
      } else if (Array.isArray(value) && value.length > 0) {
        const arrayItems = value.map(item => typeof item === 'string' ? item : String(item)).join(', ');
        content += `${key}: [${arrayItems}]\n`;
      } else if (typeof value === 'boolean' || typeof value === 'number') {
        content += `${key}: ${value}\n`;
      } else if (Array.isArray(value)) {
        // Handle empty arrays
        content += `${key}: []\n`;
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
