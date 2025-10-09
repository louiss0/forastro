import type { Tree } from '@nx/devkit';
import {
  readProjectConfiguration,
  formatFiles,
  joinPathFragments,
  names,
} from '@nx/devkit';
import { join } from 'node:path';
import {
  parseAstroConfigDirs,
  listContentCollections,
  detectContentTypeSupport,
} from '../../utils/astro.js';

interface Schema {
  project: string;
  collection: string;
  contentType: 'markdown' | 'mdx' | 'markdoc' | 'asciidoc';
  name: string;
}

type ContentType = Schema['contentType'];

function getExtension(contentType: ContentType): string {
  const extensionMap: Record<ContentType, string> = {
    markdown: '.md',
    mdx: '.mdx',
    markdoc: '.md',
    asciidoc: '.adoc',
  };
  return extensionMap[contentType];
}

function generateMarkdownContent(title: string): string {
  return `---
title: "${title}"
description: ""
pubDate: ${new Date().toISOString()}
draft: true
tags: []
---

## Introduction

<!-- TODO: Add your content here -->

## Content

<!-- TODO: Add more sections -->
`;
}

function generateAsciidocContent(title: string): string {
  return `= ${title}
:description:
:tags:
:draft: true
:pubDate: ${new Date().toISOString()}

== Introduction

// TODO: Add your content here

== Content

// TODO: Add more sections
`;
}

/**
 * Generate content for an Astro content collection.
 *
 * Creates a new content file (Markdown, MDX, Markdoc, or AsciiDoc) in the specified
 * collection. Validates that the collection exists and that the required integrations
 * are installed for the chosen content type.
 *
 * @param tree - Nx virtual file system tree
 * @param options - Content generation options
 * @param options.project - Name of the Nx project
 * @param options.collection - Target content collection (e.g., 'posts', 'docs')
 * @param options.contentType - Content file format: 'markdown', 'mdx', 'markdoc', or 'asciidoc'
 * @param options.name - Content file name (will be slugified)
 *
 * @throws Error if collection doesn't exist
 * @throws Error if content type integration is not installed
 *
 * @example
 * // Generate a markdown blog post
 * await generator(tree, {
 *   project: 'my-site',
 *   collection: 'posts',
 *   contentType: 'markdown',
 *   name: 'My First Post'
 * });
 * // Creates: src/content/posts/my-first-post.md
 *
 * @example
 * // Generate MDX content with interactive components
 * await generator(tree, {
 *   project: 'my-site',
 *   collection: 'posts',
 *   contentType: 'mdx',
 *   name: 'Interactive Post'
 * });
 * // Creates: src/content/posts/interactive-post.mdx
 */
export default async function generator(tree: Tree, options: Schema) {
  const proj = readProjectConfiguration(tree, options.project);
  const { contentDir } = parseAstroConfigDirs(proj.root);

  // Validate collection exists
  const availableCollections = listContentCollections(proj.root);
  if (!availableCollections.includes(options.collection)) {
    throw new Error(
      `Collection '${options.collection}' not found.\n` +
        `Available collections: ${availableCollections.length > 0 ? availableCollections.join(', ') : 'none'}\n` +
        `Create a collection in src/content/config.ts or as a directory in src/content/`,
    );
  }

  // Detect and validate content type support
  const support = detectContentTypeSupport(proj.root);

  if (options.contentType === 'mdx' && !support.mdx) {
    throw new Error(
      `Content type 'mdx' is not supported.\n` +
        `To use MDX:\n` +
        `  - Install: npm install @astrojs/mdx\n` +
        `  - Add to astro.config: import mdx from '@astrojs/mdx'`,
    );
  }

  if (options.contentType === 'markdoc' && !support.markdoc) {
    throw new Error(
      `Content type 'markdoc' is not supported.\n` +
        `To use Markdoc:\n` +
        `  - Install: npm install @astrojs/markdoc\n` +
        `  - Add to astro.config: import markdoc from '@astrojs/markdoc'`,
    );
  }

  if (options.contentType === 'asciidoc' && !support.asciidoc) {
    throw new Error(
      `Content type 'asciidoc' is not supported.\n` +
        `To use AsciiDoc:\n` +
        `  - Install: npm install asciidoctor`,
    );
  }

  // Generate file
  const { fileName } = names(options.name);
  const ext = getExtension(options.contentType);
  const filePath = join(
    joinPathFragments(proj.root, contentDir, options.collection),
    `${fileName}${ext}`,
  );

  if (!tree.exists(filePath)) {
    const title = names(options.name)
      .className.replace(/([A-Z])/g, ' $1')
      .trim();
    const content =
      options.contentType === 'asciidoc'
        ? generateAsciidocContent(title)
        : generateMarkdownContent(title);

    tree.write(filePath, content);
  }

  await formatFiles(tree);
}
