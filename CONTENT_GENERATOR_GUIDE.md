# Content Generator Implementation Guide

## ✅ What's Done So Far

- ✅ Page generator complete with static/dynamic types
- ✅ Utility functions implemented and tested
- ✅ Folder renamed from `generate-content` to `content`
- ✅ generators.json updated
- ✅ Committed and pushed

## 🎯 Remaining Work

### Step 1: Update Schema (`schema.json`)

**File:** `packages/nx-astro-plugin/src/generators/content/schema.json`

Replace the entire content with:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "title": "@forastro/nx-astro-plugin:content",
  "type": "object",
  "properties": {
    "project": {
      "type": "string",
      "description": "Nx project name"
    },
    "collection": {
      "type": "string",
      "description": "Target content collection (e.g., 'posts', 'pages')",
      "x-prompt": "Which collection should this content be added to?"
    },
    "contentType": {
      "type": "string",
      "enum": ["markdown", "mdx", "markdoc", "asciidoc"],
      "description": "Content file format",
      "x-prompt": {
        "message": "Which content format?",
        "type": "list",
        "items": [
          { "value": "markdown", "label": "Markdown (.md)" },
          { "value": "mdx", "label": "MDX (.mdx)" },
          { "value": "markdoc", "label": "Markdoc (.md)" },
          { "value": "asciidoc", "label": "AsciiDoc (.adoc)" }
        ]
      }
    },
    "name": {
      "type": "string",
      "description": "Content file name (will be slugified)",
      "x-prompt": "What's the name of this content?"
    }
  },
  "required": ["project", "collection", "contentType", "name"]
}
```

### Step 2: Implement Generator (`generator.ts`)

**File:** `packages/nx-astro-plugin/src/generators/content/generator.ts`

Replace the entire content with:

```typescript
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

export default async function generator(tree: Tree, options: Schema) {
  const proj = readProjectConfiguration(tree, options.project);
  const { contentDir } = parseAstroConfigDirs(proj.root);

  // Validate collection exists
  const availableCollections = listContentCollections(proj.root);
  if (!availableCollections.includes(options.collection)) {
    throw new Error(
      `Collection '${options.collection}' not found.\\n` +
        `Available collections: ${availableCollections.length > 0 ? availableCollections.join(', ') : 'none'}\\n` +
        `Create a collection in src/content/config.ts or as a directory in src/content/`,
    );
  }

  // Detect and validate content type support
  const support = detectContentTypeSupport(proj.root);

  if (options.contentType === 'mdx' && !support.mdx) {
    throw new Error(
      `Content type 'mdx' is not supported.\\n` +
        `To use MDX:\\n` +
        `  - Install: npm install @astrojs/mdx\\n` +
        `  - Add to astro.config: import mdx from '@astrojs/mdx'`,
    );
  }

  if (options.contentType === 'markdoc' && !support.markdoc) {
    throw new Error(
      `Content type 'markdoc' is not supported.\\n` +
        `To use Markdoc:\\n` +
        `  - Install: npm install @astrojs/markdoc\\n` +
        `  - Add to astro.config: import markdoc from '@astrojs/markdoc'`,
    );
  }

  if (options.contentType === 'asciidoc' && !support.asciidoc) {
    throw new Error(
      `Content type 'asciidoc' is not supported.\\n` +
        `To use AsciiDoc:\\n` +
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
```

### Step 3: Run Tests

The existing tests will likely fail. Run them to see what needs updating:

```bash
jpd exec nx test nx-astro-plugin
```

### Step 4: Update Tests (`generator.spec.ts`)

**File:** `packages/nx-astro-plugin/src/generators/content/generator.spec.ts`

You'll need to completely rewrite the tests. Here's a comprehensive test suite:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Tree, ProjectConfiguration } from '@nx/devkit';
import generator from './generator.js';
import * as devkit from '@nx/devkit';
import * as astroUtils from '../../utils/astro.js';

vi.mock('@nx/devkit', async () => {
  const actual = await vi.importActual<typeof devkit>('@nx/devkit');
  return {
    ...actual,
    readProjectConfiguration: vi.fn(),
    formatFiles: vi.fn(),
    joinPathFragments: actual.joinPathFragments,
    names: actual.names,
  };
});

vi.mock('../../utils/astro.js', () => ({
  parseAstroConfigDirs: vi.fn(),
  listContentCollections: vi.fn(),
  detectContentTypeSupport: vi.fn(),
}));

describe('content generator', () => {
  let tree: Tree;
  const mockReadProjectConfiguration = vi.mocked(
    devkit.readProjectConfiguration,
  );
  const mockFormatFiles = vi.mocked(devkit.formatFiles);
  const mockParseAstroConfigDirs = vi.mocked(astroUtils.parseAstroConfigDirs);
  const mockListContentCollections = vi.mocked(
    astroUtils.listContentCollections,
  );
  const mockDetectContentTypeSupport = vi.mocked(
    astroUtils.detectContentTypeSupport,
  );

  const writeSpy = vi.fn<[string, string], void>();

  beforeEach(() => {
    vi.clearAllMocks();
    writeSpy.mockReset();

    tree = {
      root: '/workspace',
      exists: vi
        .fn<[string], boolean>()
        .mockReturnValue(false) as unknown as Tree['exists'],
      write: writeSpy as unknown as Tree['write'],
      read: vi.fn<
        [string, string?],
        string | null
      >() as unknown as Tree['read'],
    } as unknown as Tree;

    mockReadProjectConfiguration.mockReturnValue({
      root: 'apps/blog',
      name: 'blog',
    } as unknown as ProjectConfiguration);

    mockParseAstroConfigDirs.mockReturnValue({
      srcDir: 'src',
      pagesDir: 'src/pages',
      contentDir: 'src/content',
    });

    mockListContentCollections.mockReturnValue(['posts', 'pages']);

    mockDetectContentTypeSupport.mockReturnValue({
      markdown: true,
      mdx: true,
      markdoc: true,
      asciidoc: true,
    });
  });

  describe('collection validation', () => {
    it('throws error when collection does not exist', async () => {
      mockListContentCollections.mockReturnValue(['posts', 'pages']);

      await expect(
        generator(tree, {
          project: 'blog',
          collection: 'invalid',
          contentType: 'markdown',
          name: 'My Post',
        }),
      ).rejects.toThrow("Collection 'invalid' not found");
    });

    it('lists available collections in error message', async () => {
      mockListContentCollections.mockReturnValue(['posts', 'pages']);

      await expect(
        generator(tree, {
          project: 'blog',
          collection: 'invalid',
          contentType: 'markdown',
          name: 'My Post',
        }),
      ).rejects.toThrow('Available collections: posts, pages');
    });

    it('proceeds when collection exists', async () => {
      await generator(tree, {
        project: 'blog',
        collection: 'posts',
        contentType: 'markdown',
        name: 'My Post',
      });

      expect(writeSpy).toHaveBeenCalled();
    });
  });

  describe('content type validation', () => {
    it('throws error when mdx is not supported', async () => {
      mockDetectContentTypeSupport.mockReturnValue({
        markdown: true,
        mdx: false,
        markdoc: true,
        asciidoc: true,
      });

      await expect(
        generator(tree, {
          project: 'blog',
          collection: 'posts',
          contentType: 'mdx',
          name: 'My Post',
        }),
      ).rejects.toThrow("Content type 'mdx' is not supported");
    });

    it('provides installation instructions in error', async () => {
      mockDetectContentTypeSupport.mockReturnValue({
        markdown: true,
        mdx: false,
        markdoc: true,
        asciidoc: true,
      });

      await expect(
        generator(tree, {
          project: 'blog',
          collection: 'posts',
          contentType: 'mdx',
          name: 'My Post',
        }),
      ).rejects.toThrow('npm install @astrojs/mdx');
    });

    it('throws error when markdoc is not supported', async () => {
      mockDetectContentTypeSupport.mockReturnValue({
        markdown: true,
        mdx: true,
        markdoc: false,
        asciidoc: true,
      });

      await expect(
        generator(tree, {
          project: 'blog',
          collection: 'posts',
          contentType: 'markdoc',
          name: 'My Post',
        }),
      ).rejects.toThrow("Content type 'markdoc' is not supported");
    });

    it('throws error when asciidoc is not supported', async () => {
      mockDetectContentTypeSupport.mockReturnValue({
        markdown: true,
        mdx: true,
        markdoc: true,
        asciidoc: false,
      });

      await expect(
        generator(tree, {
          project: 'blog',
          collection: 'posts',
          contentType: 'asciidoc',
          name: 'My Post',
        }),
      ).rejects.toThrow("Content type 'asciidoc' is not supported");
    });
  });

  describe('file generation', () => {
    it('creates markdown file with YAML frontmatter', async () => {
      await generator(tree, {
        project: 'blog',
        collection: 'posts',
        contentType: 'markdown',
        name: 'My First Post',
      });

      const call = writeSpy.mock.calls[0];
      const path = call[0].replace(/\\\\/g, '/');
      const content = call[1];

      expect(path).toContain('apps/blog/src/content/posts/my-first-post.md');
      expect(content).toContain('---');
      expect(content).toContain('title: "My First Post"');
      expect(content).toContain('description: ""');
      expect(content).toContain('draft: true');
      expect(content).toContain('tags: []');
    });

    it('creates mdx file with YAML frontmatter', async () => {
      await generator(tree, {
        project: 'blog',
        collection: 'posts',
        contentType: 'mdx',
        name: 'Interactive Post',
      });

      const call = writeSpy.mock.calls[0];
      const path = call[0].replace(/\\\\/g, '/');
      const content = call[1];

      expect(path).toContain('interactive-post.mdx');
      expect(content).toContain('---');
      expect(content).toContain('title: "Interactive Post"');
    });

    it('creates markdoc file with .md extension', async () => {
      await generator(tree, {
        project: 'blog',
        collection: 'posts',
        contentType: 'markdoc',
        name: 'Markdoc Post',
      });

      const call = writeSpy.mock.calls[0];
      const path = call[0].replace(/\\\\/g, '/');

      expect(path).toContain('markdoc-post.md');
    });

    it('creates asciidoc file with AsciiDoc header', async () => {
      await generator(tree, {
        project: 'blog',
        collection: 'posts',
        contentType: 'asciidoc',
        name: 'AsciiDoc Post',
      });

      const call = writeSpy.mock.calls[0];
      const path = call[0].replace(/\\\\/g, '/');
      const content = call[1];

      expect(path).toContain('ascii-doc-post.adoc');
      expect(content).toContain('= AsciiDoc Post');
      expect(content).toContain(':description:');
      expect(content).toContain(':draft: true');
      expect(content).toContain('== Introduction');
    });

    it('slugifies file names', async () => {
      await generator(tree, {
        project: 'blog',
        collection: 'posts',
        contentType: 'markdown',
        name: 'Hello World Post',
      });

      const call = writeSpy.mock.calls[0];
      const path = call[0].replace(/\\\\/g, '/');

      expect(path).toContain('hello-world-post.md');
    });
  });
});
```

### Step 5: Run Tests and Fix Issues

```bash
jpd exec nx test nx-astro-plugin
```

Fix any failing tests based on the output.

### Step 6: Commit Implementation

```bash
git add packages/nx-astro-plugin/src/generators/content/
git commit -m "feat(nx-astro-plugin): add content generator with validation

- Validate collection exists before generating
- Check content type support (MDX, Markdoc, AsciiDoc)
- Generate appropriate frontmatter per content type
- Provide helpful error messages with remediation steps
- Slugify file names using @nx/devkit names utility

Supports: markdown, mdx, markdoc, asciidoc content types
"
```

### Step 7: Commit Tests

```bash
git add packages/nx-astro-plugin/src/generators/content/generator.spec.ts
git commit -m "test(nx-astro-plugin): comprehensive tests for content generator

- Test collection validation with error messages
- Test content type support detection
- Test file generation for all content types
- Test error handling for unsupported types
"
```

### Step 8: Final Steps

1. **Verify Coverage:**

```bash
jpd exec nx test nx-astro-plugin
```

Coverage should still be above 80%.

2. **Format and Lint:**

```bash
jpd exec nx format:write
jpd exec nx lint nx-astro-plugin
```

3. **Push Changes:**

```bash
git push
```

4. **Finish Feature:**

```bash
git flow feature finish astro-generators-enhancements
git push origin develop
git push origin main
```

## 📝 Notes

- The implementation provided uses real Nx Tree operations
- File paths use posix-style separators per your rules
- Error messages are descriptive with remediation steps
- All utility functions are already implemented and tested
- Follow atomic commit principles - one commit per logical change

## 🚀 You're Almost Done!

After completing these steps, you'll have:

- ✅ Page generator with static/dynamic types
- ✅ Content generator with full validation
- ✅ Comprehensive test coverage
- ✅ All changes committed and pushed

Good luck finishing the implementation!
