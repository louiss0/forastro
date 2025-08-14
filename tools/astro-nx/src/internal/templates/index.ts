/**
 * In-memory template factories for Astro generators.
 * 
 * This module provides pure functions that return template strings for various
 * Astro artifacts, eliminating the need for runtime disk reads during generation.
 * All templates support required variants based on generator options and detected defaults.
 */

export interface TemplateOptions {
  title?: string;
  description?: string;
  className?: string;
  kebabName?: string;
  pascalName?: string;
  hasProps?: boolean;
  propsInterface?: string;
  propsExtraction?: string;
  style?: 'none' | 'scoped' | 'global';
  language?: 'ts' | 'js';
  ext?: string;
  layout?: string;
  layoutImportPath?: string;
  frontmatter?: Record<string, unknown>;
  author?: string;
  tags?: string[];
  pubDate?: string;
  isPage?: boolean;
  isDynamic?: boolean;
}

/**
 * Generate Astro component template content
 */
export function componentAstroTemplate(options: TemplateOptions = {}): string {
  const {
    title = 'Sample Component',
    className = 'component',
    hasProps = false,
    propsInterface = '',
    propsExtraction = '',
    style = 'scoped'
  } = options;

  // Generate frontmatter
  let frontmatter: string;
  if (hasProps && propsInterface && propsExtraction) {
    frontmatter = `---\n${propsInterface}\n\n${propsExtraction}\n---`;
  } else {
    frontmatter = `---\nexport interface Props {\n  title?: string;\n  class?: string;\n}\n\nconst { title = '${title}', class: className } = Astro.props;\n---`;
  }

  // Generate component body - include the component name in a comment for identification
  const body = `\n<!-- ${title} Component -->\n<div class={\`${className} \${className || ''}\`}>\n  <h2>{title}</h2>\n  <p>This is a sample Astro component that you can use as a template.</p>\n  <slot />\n</div>`;

  // Generate styles based on style option
  let styles = '';
  if (style === 'scoped') {
    styles = `\n\n<style>\n  .${className} {\n    padding: 1rem;\n    border: 1px solid #ccc;\n    border-radius: 0.5rem;\n    margin: 1rem 0;\n  }\n  \n  .${className} h2 {\n    margin-top: 0;\n    color: #333;\n  }\n  \n  .${className} p {\n    color: #666;\n  }\n</style>`;
  } else if (style === 'global') {
    styles = `\n\n<style is:global>\n  .${className} {\n    padding: 1rem;\n    border: 1px solid #ccc;\n    border-radius: 0.5rem;\n    margin: 1rem 0;\n  }\n  \n  .${className} h2 {\n    margin-top: 0;\n    color: #333;\n  }\n  \n  .${className} p {\n    color: #666;\n  }\n</style>`;
  }
  // style = 'none' omits the style block entirely

  return `${frontmatter}${body}${styles}`;
}

/**
 * Generate Astro page template content
 */
export function pageAstroTemplate(options: TemplateOptions = {}): string {
  const {
    title = 'Sample Astro Page',
    description = 'This is a sample Astro page template',
    layout,
    frontmatter = {},
    // Check if this is a dynamic page based on title containing brackets
    isDynamic = title?.includes('[') || false
  } = options;

  if (layout) {
    // Create frontmatter-based layout (for content collections)
    let frontmatterSection = `---\nlayout: '${layout}'`;
    
    // Add metadata to frontmatter
    if (title !== 'Sample Astro Page') {
      frontmatterSection += `\ntitle: '${title}'`;
    }
    if (description && description !== 'This is a sample Astro page template') {
      frontmatterSection += `\ndescription: '${description}'`;
    }
    
    // Add custom frontmatter properties
    Object.entries(frontmatter).forEach(([key, value]) => {
      if (key !== 'title' && key !== 'description' && key !== 'layout') {
        if (typeof value === 'string') {
          frontmatterSection += `\n${key}: '${value}'`;
        } else {
          frontmatterSection += `\n${key}: ${JSON.stringify(value)}`;
        }
      }
    });
    
    if (isDynamic) {
      frontmatterSection += `\n\n// Dynamic page - access route parameters\n// const { slug } = Astro.params;`;
    }
    
    frontmatterSection += `\n---`;
    
    let pageContent;
    if (isDynamic) {
      pageContent = `\n\n<main>
  <h1>${title}</h1>
  <p>Dynamic page parameter: {slug}</p>
  <p>Welcome to your new Astro page!</p>
</main>`;
    } else {
      pageContent = `\n\n<main>
  <h1>${title}</h1>
  <p>Welcome to your new Astro page!</p>
</main>`;
    }
    
    return `${frontmatterSection}${pageContent}`;
  }

  // Full page without layout
  const frontmatterSection = `---\nconst title = '${title}';\nconst description = '${description}';\n---`;

  // Full page template
  return `${frontmatterSection}

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width" />
    <meta name="generator" content={Astro.generator} />
    <title>{title}</title>
    <meta name="description" content={description} />
  </head>
  <body>
    <main>
      <h1>{title}</h1>
      <p>{description}</p>
      
      <section>
        <h2>Getting Started</h2>
        <p>This is a sample page that you can use as a template for creating new pages in your Astro project.</p>
        
        <ul>
          <li>Edit this file to customize the content</li>
          <li>Add components and layouts as needed</li>
          <li>Use Astro's powerful features for building static sites</li>
        </ul>
      </section>
    </main>
  </body>
</html>

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }
  
  h1 {
    color: #333;
    margin-bottom: 1rem;
  }
  
  section {
    margin-top: 2rem;
  }
  
  ul {
    margin: 1rem 0;
  }
  
  li {
    margin: 0.5rem 0;
  }
</style>`;
}

/**
 * Generate Markdown content template
 */
export function contentTemplateMd(options: TemplateOptions = {}): string {
  const {
    title = 'Sample Markdown Content',
    description = 'This is a sample markdown content file',
    author = 'Astro',
    tags = ['sample', 'markdown'],
    pubDate = new Date().toISOString().split('T')[0],
    frontmatter = {}
  } = options;

  // Build frontmatter
  const fm = {
    title,
    description,
    pubDate,
    author,
    tags,
    ...frontmatter
  };

  let frontmatterString = '---\n';
  Object.entries(fm).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        // For arrays, don't quote individual elements for cleaner output
        frontmatterString += `${key}: [${value.map(v => typeof v === 'string' ? v : v).join(', ')}]\n`;
      } else if (typeof value === 'string' && value !== '') {
        // Don't quote string values in YAML frontmatter unless they contain special chars
        const needsQuotes = /[:{}[\],&*#?|\-<>=!%@`]/.test(value) || value.includes('\n');
        frontmatterString += needsQuotes ? `${key}: '${value}'\n` : `${key}: ${value}\n`;
      } else if (typeof value === 'string' && value === '') {
        // Empty strings should be quoted
        frontmatterString += `${key}: ''\n`;
      } else {
        frontmatterString += `${key}: ${value}\n`;
      }
    }
  });
  frontmatterString += '---';

  return `${frontmatterString}

# ${title}

<!-- generated by astro-nx -->

This is a sample markdown content file that can be used as a template for new content.

## Features

- Standard markdown formatting
- Frontmatter for metadata
- Simple and clean structure

## Usage

Copy this file and modify the frontmatter and content as needed for your specific use case.`;
}

/**
 * Generate MDX content template
 */
export function contentTemplateMdx(options: TemplateOptions = {}): string {
  const {
    title = 'Sample MDX Content',
    description = 'This is a sample MDX content file with React components',
    author = 'Astro',
    tags = ['sample', 'mdx', 'react'],
    pubDate = new Date().toISOString().split('T')[0],
    frontmatter = {}
  } = options;

  // Build frontmatter
  const fm = {
    title,
    description,
    pubDate,
    author,
    tags,
    ...frontmatter
  };

  let frontmatterString = '---\n';
  Object.entries(fm).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        // For arrays, don't quote individual elements for cleaner output
        frontmatterString += `${key}: [${value.map(v => typeof v === 'string' ? v : v).join(', ')}]\n`;
      } else if (typeof value === 'string' && value !== '') {
        // Don't quote string values in YAML frontmatter unless they contain special chars
        const needsQuotes = /[:{}[\],&*#?|\-<>=!%@`]/.test(value) || value.includes('\n');
        frontmatterString += needsQuotes ? `${key}: '${value}'\n` : `${key}: ${value}\n`;
      } else if (typeof value === 'string' && value === '') {
        // Empty strings should be quoted
        frontmatterString += `${key}: ''\n`;
      } else {
        frontmatterString += `${key}: ${value}\n`;
      }
    }
  });
  frontmatterString += '---';

  return `${frontmatterString}

import { Alert } from '../../../components/Alert.astro';

# ${title}

<!-- generated by astro-nx -->

This is a sample MDX content file that demonstrates how to combine Markdown with interactive components.

## Features

- Markdown formatting
- JSX components
- Import statements
- Interactive content

## Interactive Example

<Alert type="info">
  This is an example of a React component embedded in MDX content!
</Alert>

## Usage

Copy this file and modify the frontmatter and content as needed. You can use JSX components in your MDX files.

{/* Example JSX component usage */}
{/* <CustomComponent prop="value" /> */}`;
}

/**
 * Generate Markdoc content template
 */
export function contentTemplateMarkdoc(options: TemplateOptions = {}): string {
  const {
    title = 'Sample Markdoc Content',
    description = 'This is a sample Markdoc content file',
    author = 'Astro',
    tags = ['sample', 'markdoc'],
    pubDate = new Date().toISOString().split('T')[0],
    frontmatter = {}
  } = options;

  // Build frontmatter
  const fm = {
    title,
    description,
    pubDate,
    author,
    tags,
    ...frontmatter
  };

  let frontmatterString = '---\n';
  Object.entries(fm).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        // For arrays, don't quote individual elements for cleaner output
        frontmatterString += `${key}: [${value.map(v => typeof v === 'string' ? v : v).join(', ')}]\n`;
      } else if (typeof value === 'string' && value !== '') {
        // Don't quote string values in YAML frontmatter unless they contain special chars
        const needsQuotes = /[:{}[\],&*#?|\-<>=!%@`]/.test(value) || value.includes('\n');
        frontmatterString += needsQuotes ? `${key}: '${value}'\n` : `${key}: ${value}\n`;
      } else if (typeof value === 'string' && value === '') {
        // Empty strings should be quoted
        frontmatterString += `${key}: ''\n`;
      } else {
        frontmatterString += `${key}: ${value}\n`;
      }
    }
  });
  frontmatterString += '---';

  return `${frontmatterString}

# ${title}

<!-- generated by astro-nx -->

This is a sample Markdoc content file that demonstrates Markdoc's powerful features.

## Features

- Enhanced markdown syntax
- Custom Markdoc tags and components
- Powerful templating
- Schema validation

## Example Tag

{% callout type="note" %}
This is a Markdoc callout component!
{% /callout %}

## Usage

Copy this file and modify the frontmatter and content as needed. Markdoc provides a rich set of features for content creation.`;
}

/**
 * Generate AsciiDoc content template
 */
export function contentTemplateAsciidoc(options: TemplateOptions = {}): string {
  const {
    title = 'Sample AsciiDoc Content',
    description = 'This is a sample AsciiDoc content file',
    author = 'Astro',
    tags = ['sample', 'asciidoc'],
    pubDate = new Date().toISOString().split('T')[0],
    frontmatter = {}
  } = options;

  // Build frontmatter (AsciiDoc uses attributes)
  const fm = {
    title,
    description,
    pubDate,
    author,
    tags,
    doctitle: title,
    ...frontmatter
  };

  let frontmatterString = '---\n';
  Object.entries(fm).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        // For arrays, don't quote individual elements for cleaner output
        frontmatterString += `${key}: [${value.map(v => typeof v === 'string' ? v : v).join(', ')}]\n`;
      } else if (typeof value === 'string' && value !== '') {
        // Don't quote string values in YAML frontmatter unless they contain special chars
        const needsQuotes = /[:{}[\],&*#?|\-<>=!%@`]/.test(value) || value.includes('\n');
        frontmatterString += needsQuotes ? `${key}: '${value}'\n` : `${key}: ${value}\n`;
      } else if (typeof value === 'string' && value === '') {
        // Empty strings should be quoted
        frontmatterString += `${key}: ''\n`;
      } else {
        frontmatterString += `${key}: ${value}\n`;
      }
    }
  });
  frontmatterString += '---';

  return `${frontmatterString}

= ${title}

This is a sample AsciiDoc content file that can be used as a template for new content.

== Features

* Rich text formatting with AsciiDoc
* Frontmatter for metadata  
* Professional documentation structure

== Usage

Copy this file and modify the frontmatter and content as needed for your specific use case.

NOTE: AsciiDoc provides powerful formatting options for technical documentation.`;
}

/**
 * Generic Astro file template (for arbitrary files)
 */
export function astroFileTemplate(options: TemplateOptions = {}): string {
  const {
    ext = 'astro',
    isPage = false
  } = options;

  if (ext === 'astro') {
    if (isPage) {
      return pageAstroTemplate(options);
    }
    return componentAstroTemplate(options);
  }

  // Handle content files
  switch (ext) {
    case 'md':
      return contentTemplateMd(options);
    case 'mdx':
      return contentTemplateMdx(options);
    case 'mdoc':
    case 'markdoc':
      return contentTemplateMarkdoc(options);
    case 'adoc':
      return contentTemplateAsciidoc(options);
    default:
      // Default to markdown
      return contentTemplateMd(options);
  }
}

/**
 * Helper to determine template type based on file extension
 */
export function getTemplateByExtension(ext: string, options: TemplateOptions = {}): string {
  switch (ext) {
    case 'astro':
      return options.isPage ? pageAstroTemplate(options) : componentAstroTemplate(options);
    case 'md':
      return contentTemplateMd(options);
    case 'mdx':
      return contentTemplateMdx(options);
    case 'mdoc':
    case 'markdoc':
      return contentTemplateMarkdoc(options);
    case 'adoc':
      return contentTemplateAsciidoc(options);
    default:
      return astroFileTemplate({ ...options, ext });
  }
}

/**
 * TypeScript interface template generator
 */
export function generateTypeScriptInterface(name: string, props: Array<{ name: string; type: string; optional?: boolean }>): string {
  const interfaceName = name.endsWith('Props') ? name : `${name}Props`;
  
  let interfaceContent = `export interface ${interfaceName} {\n`;
  
  props.forEach(prop => {
    const optional = prop.optional ? '?' : '';
    interfaceContent += `  ${prop.name}${optional}: ${prop.type};\n`;
  });
  
  interfaceContent += '}';
  
  return interfaceContent;
}
