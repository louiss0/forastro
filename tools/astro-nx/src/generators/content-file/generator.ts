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
import { hasContentCollections, readAstroConfig } from '../../internal/detect/config';

export interface ContentFileGeneratorSchema {
  name: string;
  project: string;
  collection?: string;
  directory?: string;
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
  
  // Determine the extension - default by detected integrations or use provided
  let ext = options.ext;
  if (!ext) {
    // Prefer detected integrations for default extension
    if (detectedConfig.integrations?.includes('mdx')) {
      ext = 'mdx';
    } else if (detectedConfig.integrations?.includes('markdoc')) {
      ext = 'mdoc';
    } else if (detectedConfig.integrations?.includes('asciidoc')) {
      ext = 'adoc';
    } else {
      // Default to markdown
      ext = 'md';
    }
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
    const fallbackCollection = options.collection || 'content';
    const contentBase = detectedConfig.contentDir || 'src/content';
    targetDir = join(contentBase, fallbackCollection);
    filePath = join(projectRoot, targetDir, `${name}.${ext}`);
  }
  
  // Create frontmatter presets based on file extension and detected config
  const frontmatterPreset = getFrontmatterPreset(ext, options.frontmatter, detectedConfig);
  
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

function getFrontmatterPreset(ext: string, customFrontmatter?: Record<string, any>, _detectedConfig?: any): Record<string, any> {
  const basePreset: Record<string, any> = {
    title: '',
    description: '',
    pubDate: new Date().toISOString().split('T')[0],
  };
  
  let extendedPreset: Record<string, any> = { ...basePreset };
  
  switch (ext) {
    case 'md':
    case 'mdx':
      extendedPreset = {
        ...basePreset,
        author: '',
        tags: [],
        draft: false,
      };
      break;
    case 'adoc':
      extendedPreset = {
        ...basePreset,
        author: '',
        keywords: [],
        doctitle: '',
      };
      break;
    case 'mdoc':
      extendedPreset = {
        ...basePreset,
        author: '',
        tags: [],
      };
      break;
    default:
      break;
  }
  
  // Merge with custom frontmatter if provided
  if (customFrontmatter) {
    extendedPreset = { ...extendedPreset, ...customFrontmatter };
  }
  
  return extendedPreset;
}

function addFiles(tree: Tree, options: ReturnType<typeof normalizeOptions>) {
  const content = generateContentByExtension(options.ext, options);
  const targetPath = join(options.projectRoot, options.targetDir, `${options.name}.${options.ext}`);
  
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
  
  // Generate frontmatter
  Object.entries(frontmatter).forEach(([key, value]) => {
    if (value !== '') {
      if (typeof value === 'string') {
        content += `${key}: '${value}'\n`;
      } else if (Array.isArray(value) && value.length > 0) {
        const arrayItems = value.map(item => `'${item}'`).join(', ');
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
  
  // Generate AsciiDoc attributes
  Object.entries(frontmatter).forEach(([key, value]) => {
    if (value !== '') {
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
  
  // Generate frontmatter (same as Markdown)
  Object.entries(frontmatter).forEach(([key, value]) => {
    if (value !== '') {
      if (typeof value === 'string') {
        content += `${key}: '${value}'\n`;
      } else if (Array.isArray(value) && value.length > 0) {
        const arrayItems = value.map(item => `'${item}'`).join(', ');
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
