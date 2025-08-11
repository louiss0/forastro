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
import { getDefaultContentExt } from '../../internal/detect/project-type.js';
import { readAstroConfig } from '../../internal/detect/config';

export interface PageGeneratorSchema {
  name: string;
  project: string;
  directory?: string;
  ext?: 'astro' | 'md' | 'adoc' | 'mdx' | 'mdoc';
  layout?: string;
  frontmatter?: Record<string, any>;
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
  
  // Detect default ext via detected integrations first, then fallback to getDefaultContentExt
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
      // Fallback to project type detection
      try {
        const defaultExt = getDefaultContentExt(projectRoot);
        // Map ContentExtension to our supported formats
        switch (defaultExt) {
          case '.adoc':
            ext = 'adoc';
            break;
          case '.mdx':
            ext = 'mdx';
            break;
          case '.mdoc':
            ext = 'mdoc';
            break;
          case '.md':
            ext = 'md';
            break;
          default:
            ext = 'astro';
            break;
        }
      } catch {
        // Default to astro if detection fails
        ext = 'astro';
      }
    }
  }
  
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
  
  // Generate basic title from name if not in frontmatter
  const title = options.frontmatter?.['title'] || names(fileName).className;
  
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
  
  // Create the target file path
  const targetPath = join(options.projectRoot, 'src', 'pages', options.directory, options.fileName);
  
  // Write the processed content to the tree
  tree.write(targetPath, content);
}

function generateFrontmatter(options: ReturnType<typeof normalizeOptions>): string {
  const lines = ['---'];
  
  // Add layout if specified
  if (options.layout) {
    lines.push(`layout: '${options.layout}'`);
  }
  
  // Add title
  lines.push(`title: '${options.title}'`);
  
  // Add additional frontmatter properties
  Object.entries(options.frontmatter).forEach(([key, value]) => {
    if (key !== 'title') { // Avoid duplicate title
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
