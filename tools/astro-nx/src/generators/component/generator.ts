import type {
  Tree,
  GeneratorCallback,
} from '@nx/devkit';
import {
  formatFiles,
  runTasksInSerial,
} from '@nx/devkit';
import { join } from 'path';
import { toKebabCase, toPascalCase } from '../../internal/generate/pathing.js';
import { parseProps, emitAstroPropsInterface } from '../../internal/generate/props.js';
import { ensureTreeDirs } from '../../internal/fs/tree-io.js';
import { readFileSync } from 'fs';

export interface ComponentGeneratorSchema {
  name: string;
  project: string;
  directory?: string;
  props?: string;
  ext?: 'astro' | 'mdx';
  style?: 'none' | 'scoped' | 'global';
  language?: 'ts' | 'js';
  skipFormat?: boolean;
}

export default async function (tree: Tree, options: ComponentGeneratorSchema) {
  const tasks: GeneratorCallback[] = [];
  
  const normalizedOptions = normalizeOptions(options);
  generateComponent(tree, normalizedOptions);
  
  if (!options.skipFormat) {
    await formatFiles(tree);
  }
  
  return runTasksInSerial(...tasks);
}

function normalizeOptions(options: ComponentGeneratorSchema) {
  // Determine project root (following existing pattern)
  const projectName = options.project;
  const projectRoot = `apps/${projectName}`;
  
  // Format names - kebab-case for filename, PascalCase for component
  const kebabName = toKebabCase(options.name);
  // Use toPascalCase which now preserves intended casing correctly
  const pascalName = toPascalCase(options.name);
  
  // Determine extension
  const ext = options.ext || 'astro';
  const extension = ext === 'mdx' ? '.mdx' : '.astro';
  
  // Compute target path: src/components/<directory>/<name>.astro (or .mdx)
  const directory = options.directory || '';
  const componentsDir = join(projectRoot, 'src', 'components');
  const targetDir = directory ? join(componentsDir, directory) : componentsDir;
  const fileName = `${kebabName}${extension}`;
  const targetPath = join(targetDir, fileName);
  
  // Parse props if provided
  const propsDefinitions = options.props ? parseProps(options.props) : [];
  const hasProps = propsDefinitions.length > 0;
  
  // Generate props interface and extraction code
  const propsData = emitAstroPropsInterface(propsDefinitions);
  
  return {
    ...options,
    projectName,
    projectRoot,
    kebabName,
    pascalName,
    targetPath,
    targetDir,
    fileName,
    extension,
    hasProps,
    propsInterface: propsData.interface,
    propsExtraction: propsData.propsExtraction,
    style: options.style || 'none',
    language: options.language || 'ts',
    ext,
  };
}

function generateComponent(tree: Tree, options: ReturnType<typeof normalizeOptions>) {
  // Read the base template
  const templatePath = join(__dirname, '../../templates/components/astro/base.astro');
  let templateContent: string;
  
  try {
    templateContent = readFileSync(templatePath, 'utf-8');
  } catch {
    // Fallback template if base.astro doesn't exist
    templateContent = generateFallbackTemplate();
  }
  
  // Generate component content using template
  const componentContent = processTemplate(templateContent, options);
  
  // Ensure target directory exists using helper
  ensureTreeDirs(tree, options.targetDir);
  
  // Write the component file
  tree.write(options.targetPath, componentContent);
}

function processTemplate(template: string, options: ReturnType<typeof normalizeOptions>): string {
  let content = template;
  
  // Replace the frontmatter section based on props
  if (options.hasProps) {
    // Replace with custom props interface and extraction
    const frontmatter = [
      '---',
      options.propsInterface,
      '',
      options.propsExtraction,
      '---'
    ].join('\n');
    
    content = content.replace(
      /---[\s\S]*?---/,
      frontmatter
    );
  } else {
    // Remove props interface but keep basic structure
    content = content.replace(
      /---[\s\S]*?---/,
      '---\n// Component logic goes here\n---'
    );
  }
  
  // Replace component name in content
  content = content.replace(/{title}/g, options.pascalName);
  content = content.replace(/Sample Component/g, `${options.pascalName} Component`);
  content = content.replace(/This is a sample Astro component that you can use as a template\./g, 
    `This is the ${options.pascalName} component.`);
  
  // Class attribute normalization - use robust regexes to handle all cases
  // Replace class={`component ${className || ''}`} or class={`component ${className ?? ''}`}
  content = content.replace(/class=\{\s*`component[^`]*`\}/g, `class="${options.kebabName}"`);
  // Replace class="component"
  content = content.replace(/class="component"/g, `class="${options.kebabName}"`);
  
  // Handle style block based on style option
  if (options.style === 'none') {
    // Remove the entire style block
    content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '');
  } else if (options.style === 'scoped') {
    // Keep existing style block (it's scoped by default in Astro)
    // Just update class name to match component
    content = content.replace(/\.component/g, `.${options.kebabName}`);
  } else if (options.style === 'global') {
    // Make styles global
    content = content.replace(/<style>/g, '<style is:global>');
    content = content.replace(/\.component/g, `.${options.kebabName}`);
  }
  
  return content;
}

function generateFallbackTemplate(): string {
  return `---
// Component logic goes here
---

<div class="component">
  <h2>Component</h2>
  <p>This is your new component.</p>
  <slot />
</div>
`;
}

