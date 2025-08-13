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
import { readAstroConfig } from '../../internal/detect/config';
import { ensureTreeDirs } from '../../internal/fs/tree-io.js';

export interface PageGeneratorSchema {
  name: string;
  project: string;
  directory?: string;
  ext?: 'astro' | 'md' | 'adoc' | 'mdx' | 'mdoc';
  layout?: string;
  title?: string;
  description?: string;
  frontmatter?: Record<string, unknown>;
  skipFormat?: boolean;
}

export default async function (tree: Tree, options: PageGeneratorSchema) {
  const tasks: GeneratorCallback[] = [];
  
  const normalizedOptions = normalizeOptions(options);
  addFiles(tree, normalizedOptions);
  
  if (!options.skipFormat) {
    await formatFiles(tree);
  }
  
  return runTasksInSerial(...tasks);
}

function normalizeOptions(options: PageGeneratorSchema) {
  const projectName = options.project;
  const projectRoot = `apps/${projectName}`;
  
  // Read Astro configuration for defaults
  const detectedConfig = readAstroConfig(projectRoot);
  
  // Use simple extension detection - default to astro for page generator
  const ext = options.ext || 'astro';
  
  // Handle nested route names like "blog/[slug]" 
  const nameParts = options.name.split('/');
  const fileName = nameParts[nameParts.length - 1];
  const nameDirectory = nameParts.length > 1 ? nameParts.slice(0, -1).join('/') : '';
  
  // Combine directory option with name-based directory
  const combinedDirectory = options.directory
    ? nameDirectory
      ? join(options.directory, nameDirectory)
      : options.directory
    : nameDirectory;
  
  const fullFileName = `${fileName}.${ext}`;
  const filePath = join(
    projectRoot, 
    'src', 
    'pages', 
    combinedDirectory, 
    fullFileName
  );
  
  // Generate title - priority: provided title > frontmatter title > derived from name (PascalCase to spaced words)
  const title = options.title || options.frontmatter?.['title'] || convertPascalCaseToSpaced(names(fileName).className);
  
  return {
    ...options,
    name: fileName,
    projectName,
    projectRoot,
    directory: combinedDirectory,
    ext,
    fileName: fullFileName,
    filePath,
    title,
    detectedConfig,
    frontmatter: options.frontmatter || {},
    tmpl: '',
  };
}

function addFiles(tree: Tree, options: ReturnType<typeof normalizeOptions>) {
  let content: string;
  
  // Generate content based on extension
  switch (options.ext) {
    case 'astro':
      content = generateAstroPageContent(options);
      break;
    case 'md':
    case 'mdx':
    case 'adoc':
    case 'mdoc':
      content = generateContentPageContent(options);
      break;
    default:
      throw new Error(`Unsupported extension: ${options.ext}`);
  }
  
  // Ensure target directory exists using helper
  const pagesBase = join(options.projectRoot, 'src', 'pages');
  const targetDir = options.directory ? join(pagesBase, options.directory) : pagesBase;
  
  ensureTreeDirs(tree, targetDir);
  
  // Create the target file path
  const targetPath = join(targetDir, options.fileName);
  
  // Write the processed content to the tree
  tree.write(targetPath, content);
}

function convertPascalCaseToSpaced(pascalCase: string): string {
  return pascalCase
    // Insert space before uppercase letters (except at the start)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    // Handle consecutive capitals like "XMLHttp" -> "XML Http"
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim();
}

function generateFrontmatter(options: ReturnType<typeof normalizeOptions>): string {
  const lines = ['---'];
  
  // Add layout if specified
  if (options.layout) {
    lines.push(`layout: '${options.layout}'`);
  }
  
  // Add title
  lines.push(`title: '${options.title}'`);
  
  // Add description if provided
  if (options.description) {
    lines.push(`description: '${options.description}'`);
  }
  
  // Add additional frontmatter properties
  Object.entries(options.frontmatter).forEach(([key, value]) => {
    if (key !== 'title' && key !== 'description') { // Avoid duplicates
      lines.push(`${key}: ${JSON.stringify(value)}`);
    }
  });
  
  lines.push('---');
  return lines.join('\n');
}

function generateAstroPageContent(options: ReturnType<typeof normalizeOptions>): string {
  const frontmatter = generateFrontmatter(options);
  
  if (options.layout) {
    return `${frontmatter}

<main>
  <h1>${options.title}</h1>
  <p>Welcome to your new Astro page!</p>
</main>
`;
  } else {
    return `${frontmatter}

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width" />
    <meta name="generator" content={Astro.generator} />
    <title>${options.title}</title>
  </head>
  <body>
    <main>
      <h1>${options.title}</h1>
      <p>Welcome to your new Astro page!</p>
    </main>
  </body>
</html>
`;
  }
}

function generateContentPageContent(options: ReturnType<typeof normalizeOptions>): string {
  const frontmatter = generateFrontmatter(options);
  
  let contentHeader: string;
  let contentFooter: string;
  
  switch (options.ext) {
    case 'adoc':
      contentHeader = `= ${options.title}`;
      contentFooter = 'Write your AsciiDoc content here...';
      break;
    case 'mdx':
      contentHeader = `# ${options.title}`;
      contentFooter = 'Write your MDX content here...\n\nYou can use JSX components in this file!';
      break;
    case 'mdoc':
      contentHeader = `# ${options.title}`;
      contentFooter = 'Write your Markdoc content here...\n\nYou can use Markdoc tags and components!';
      break;
    case 'md':
    default:
      contentHeader = `# ${options.title}`;
      contentFooter = 'Write your content here...';
      break;
  }
  
  return `${frontmatter}

${contentHeader}

${contentFooter}
`;
}
