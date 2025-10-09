import type { Tree } from '@nx/devkit';
import { readProjectConfiguration, formatFiles, joinPathFragments } from '@nx/devkit';
import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { detectIntegrations } from '../../utils/astro.js';

interface Schema {
  project: string;
  includeExamples?: boolean;
  title?: string;
  description?: string;
}

/**
 * Checks if Starlight integration is installed in the project.
 *
 * Validates that @astrojs/starlight is present in both the astro.config
 * and package.json dependencies.
 *
 * @param projectRoot - Absolute path to the project directory
 * @throws Error with installation instructions if Starlight is not found
 */
function validateStarlightIntegration(projectRoot: string): void {
  // Check astro.config for @astrojs/starlight
  const integrations = detectIntegrations(projectRoot);
  const hasStarlightInConfig = integrations.includes('starlight');

  // Check package.json for @astrojs/starlight
  let hasStarlightInDeps = false;
  const pkgPath = join(projectRoot, 'package.json');
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    hasStarlightInDeps = Boolean(allDeps['@astrojs/starlight']);
  }

  if (!hasStarlightInConfig || !hasStarlightInDeps) {
    throw new Error(
      `Starlight integration is not installed.\n` +
        `\n` +
        `To use Starlight docs:\n` +
        `  1. Install Starlight: pnpm add -D @astrojs/starlight\n` +
        `  2. Add to astro.config: import starlight from '@astrojs/starlight'\n` +
        `  3. Configure in integrations array\n` +
        `\n` +
        `Or use the add-integration generator:\n` +
        `  nx g @forastro/nx-astro-plugin:add-integration --project=${projectRoot.split(/[\\/]/).pop()} --names=starlight\n` +
        `\n` +
        `Learn more: https://starlight.astro.build/getting-started/`,
    );
  }
}

/**
 * Generates the index.mdx file for Starlight docs.
 */
function generateIndexContent(title: string, description: string): string {
  return `---
title: ${title}
description: ${description}
---

# ${title}

${description}

## Getting Started

Welcome to the documentation! This site is built with [Starlight](https://starlight.astro.build/),
a full-featured documentation theme built on top of Astro.

## Navigation

Use the sidebar to navigate through the documentation.
`;
}

/**
 * Generates a getting started guide.
 */
function generateGettingStartedContent(): string {
  return `---
title: Getting Started
description: Learn how to get started with this project
---

# Getting Started

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18 or higher
- pnpm (recommended) or npm

## Installation

\`\`\`bash
pnpm install
\`\`\`

## Running Locally

\`\`\`bash
pnpm nx dev <project-name>
\`\`\`

## Building for Production

\`\`\`bash
pnpm nx build <project-name>
\`\`\`
`;
}

/**
 * Generates a guides overview.
 */
function generateGuidesOverviewContent(): string {
  return `---
title: Guides Overview
description: Comprehensive guides for working with this project
---

# Guides

This section contains detailed guides for various aspects of the project.

## Available Guides

- **Configuration**: Learn how to configure the project
- **Development**: Best practices for development
- **Deployment**: How to deploy your application
- **Testing**: Writing and running tests

## Contributing

See the CONTRIBUTING.md file for information on how to contribute to this project.
`;
}

/**
 * Generates a CLI reference.
 */
function generateCliReferenceContent(): string {
  return `---
title: CLI Reference
description: Command-line interface reference
---

# CLI Reference

Common commands for working with this project.

## Development Commands

### \`nx dev\`

Starts the development server with hot module replacement.

\`\`\`bash
nx dev <project-name>
\`\`\`

### \`nx build\`

Builds the project for production.

\`\`\`bash
nx build <project-name>
\`\`\`

### \`nx preview\`

Previews the production build locally.

\`\`\`bash
nx preview <project-name>
\`\`\`

## Testing Commands

### \`nx test\`

Runs the test suite.

\`\`\`bash
nx test <project-name>
\`\`\`

### \`nx check\`

Runs TypeScript type checking.

\`\`\`bash
nx check <project-name>
\`\`\`
`;
}

/**
 * Generates Starlight documentation structure for an Astro project.
 *
 * This generator creates a complete documentation structure using Starlight,
 * including an index page and optional example files. It validates that the
 * Starlight integration is installed before proceeding.
 *
 * Files are created in the project's content/docs directory and will not
 * overwrite existing files.
 *
 * @param tree - Nx virtual file system tree for staging file changes
 * @param options - Starlight generator options from schema.json
 * @param options.project - Name of the Nx project
 * @param options.includeExamples - Whether to generate example documentation files (default: false)
 * @param options.title - Title for the documentation site (default: 'Documentation')
 * @param options.description - Description for the documentation site (default: 'Project documentation')
 * @returns Promise that resolves when all files are created and formatted
 *
 * @throws Error if Starlight integration is not installed
 *
 * @example
 * // Generate basic Starlight docs
 * nx g @forastro/nx-astro-plugin:starlight-docs --project=my-site
 *
 * @example
 * // Generate with examples and custom title
 * nx g @forastro/nx-astro-plugin:starlight-docs --project=my-site --includeExamples=true --title="My API Docs"
 *
 * @remarks
 * Files created:
 * - Always: src/content/docs/index.mdx
 * - With includeExamples: getting-started.mdx, guides/overview.mdx, reference/cli.mdx
 *
 * Existing files are never overwritten.
 */
export default async function generator(tree: Tree, options: Schema) {
  const proj = readProjectConfiguration(tree, options.project);

  // Validate Starlight integration is installed
  validateStarlightIntegration(proj.root);

  const title = options.title || 'Documentation';
  const description = options.description || 'Project documentation';
  const includeExamples = options.includeExamples ?? false;

  // Use sourceRoot if available, otherwise fallback to proj.root/src
  const sourceRoot = proj.sourceRoot || joinPathFragments(proj.root, 'src');
  const docsDir = joinPathFragments(sourceRoot, 'content', 'docs');

  // Always create index.mdx
  const indexPath = join(docsDir, 'index.mdx');
  if (!tree.exists(indexPath)) {
    tree.write(indexPath, generateIndexContent(title, description));
  } else {
    console.log(`Skipping ${indexPath} (already exists)`);
  }

  // Create example files if requested
  if (includeExamples) {
    const exampleFiles = [
      {
        path: join(docsDir, 'getting-started.mdx'),
        content: generateGettingStartedContent(),
      },
      {
        path: join(docsDir, 'guides', 'overview.mdx'),
        content: generateGuidesOverviewContent(),
      },
      {
        path: join(docsDir, 'reference', 'cli.mdx'),
        content: generateCliReferenceContent(),
      },
    ];

    for (const file of exampleFiles) {
      if (!tree.exists(file.path)) {
        tree.write(file.path, file.content);
      } else {
        console.log(`Skipping ${file.path} (already exists)`);
      }
    }
  }

  await formatFiles(tree);
}
