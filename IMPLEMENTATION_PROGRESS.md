# Astro Generators Enhancement - Implementation Progress

## 🎯 Project Overview
Enhancing the `@forastro/nx-astro-plugin` with two major generator improvements:
1. **Page Generator**: Add static/dynamic page type support
2. **Content Generator**: Rename and add collection/content-type validation

## ✅ Completed Work

### 1. Git Flow Setup
- ✅ Feature branch created: `feature/astro-generators-enhancements`
- ✅ Branch pushed to origin
- ✅ CI-centric workflow confirmed (.github/workflows exists)

### 2. Page Generator Enhancement (COMPLETE)

#### Files Modified:
- `packages/nx-astro-plugin/src/generators/page/schema.json`
- `packages/nx-astro-plugin/src/generators/page/generator.ts`
- `packages/nx-astro-plugin/src/generators/page/generator.spec.ts`
- `packages/nx-astro-plugin/src/utils/astro.ts`
- `packages/nx-astro-plugin/src/utils/astro.spec.ts`

#### Features Implemented:
✅ **Schema Updates:**
- Added `type` field with enum `["static", "dynamic"]`
- Default value: `"static"`
- Proper description for user guidance

✅ **Static Pages:**
- Generate pages with frontmatter script section
- Include placeholder div with h1 title
- Support custom directory paths
- Respect Astro config `srcDir` setting

✅ **Dynamic Pages:**
- Auto-bracket page names (e.g., `[slug].astro`)
- Include `getStaticPaths()` export
- Import `getCollection` from `astro:content`
- TODO comments for collection customization
- Props destructuring for entry data

✅ **Directory Detection:**
- Parse `astro.config.ts/mjs/js` for `srcDir`
- Default to `src/pages` if not found
- Normalize Windows paths to forward slashes
- Handle various quote types in config

#### Utility Functions Added:
```typescript
// In src/utils/astro.ts

export interface AstroConfigDirs {
  srcDir: string;
  pagesDir: string;
  contentDir: string;
}

export function parseAstroConfigDirs(projectRoot: string): AstroConfigDirs
// Returns detected or default directories

export interface ContentTypeSupport {
  markdown: boolean;  // Always true
  mdx: boolean;       // Check @astrojs/mdx
  markdoc: boolean;   // Check @astrojs/markdoc
  asciidoc: boolean;  // Check asciidoctor packages
}

export function detectContentTypeSupport(projectRoot: string): ContentTypeSupport
// Scans astro.config and package.json

export function listContentCollections(projectRoot: string): string[]
// Parses src/content/config.ts for collection names
// Fallback: lists directories in content folder
```

#### Test Coverage:
- ✅ 34 astro utility tests (all passing)
- ✅ 8 page generator tests (all passing)
- ✅ Overall coverage: 93.28% (above 80% threshold)

#### Commit:
```
feat(nx-astro-plugin): add static and dynamic page types with dir detection

# Page generator supports dynamic routes via getStaticPaths

- Add type option (static/dynamic) to page generator schema
- Parse astro config to detect srcDir and construct pagesDir
- Generate static pages with frontmatter and placeholder content
- Generate dynamic pages with getStaticPaths and content collection support
- Add comprehensive tests for both page types and directory detection
- Add utility functions for parsing Astro config and detecting content support

BREAKING CHANGE: none

Commit: 53720f1
```

## 📋 Remaining Work: Content Generator

### Todo List Status:
The following tasks remain from your todo list:

#### Task 2: Content Generator (Rename & Enhance)

**Files to Create/Modify:**
1. `packages/nx-astro-plugin/generators.json` - Update entry
2. `packages/nx-astro-plugin/src/generators/content/` (rename from generate-content)
3. `packages/nx-astro-plugin/src/generators/content/schema.json` - New schema
4. `packages/nx-astro-plugin/src/generators/content/generator.ts` - New implementation
5. `packages/nx-astro-plugin/src/generators/content/generator.spec.ts` - New tests

**Key Requirements:**

##### Schema Design:
```json
{
  "properties": {
    "project": {
      "type": "string",
      "description": "Nx project name"
    },
    "collection": {
      "type": "string",
      "description": "Target content collection (e.g., 'posts', 'pages')"
    },
    "contentType": {
      "type": "string",
      "enum": ["markdown", "mdx", "markdoc", "asciidoc"],
      "description": "Content file format"
    },
    "name": {
      "type": "string",
      "description": "Content file name (will be slugified)"
    }
  },
  "required": ["project", "collection", "contentType", "name"]
}
```

##### Implementation Steps:
1. **Validation:**
   - Verify collection exists using `listContentCollections()`
   - If not found, throw error listing available collections
   - Verify content type support using `detectContentTypeSupport()`
   - If unsupported, throw error with installation instructions

2. **File Generation:**
   - Slugify name using `@nx/devkit` names utility
   - Map extensions:
     - `markdown` → `.md`
     - `mdx` → `.mdx`
     - `markdoc` → `.md`
     - `asciidoc` → `.adoc`
   - Construct path: `{contentDir}/{collection}/{slug}.{ext}`

3. **Frontmatter Templates:**

**Markdown/MDX/Markdoc (YAML):**
```yaml
---
title: "{{ Humanized Title }}"
description: ""
pubDate: {{ new Date().toISOString() }}
draft: true
tags: []
---

## Introduction

<!-- TODO: Add your content here -->

## Content

<!-- TODO: Add more sections -->
```

**AsciiDoc:**
```asciidoc
= {{ Humanized Title }}
:description: 
:tags: 
:draft: true
:pubDate: {{ new Date().toISOString() }}

== Introduction

// TODO: Add your content here

== Content

// TODO: Add more sections
```

##### Error Messages:
```typescript
// Collection not found
throw new Error(
  `Collection '${options.collection}' not found.\n` +
  `Available collections: ${collections.join(', ')}\n` +
  `Create collection in src/content/config.ts or as a directory in src/content/`
);

// Content type not supported
throw new Error(
  `Content type '${options.contentType}' is not supported.\n` +
  `To use ${options.contentType}:\n` +
  supportMatrix.mdx ? '' : `  - Install: npm install @astrojs/mdx\n` +
  supportMatrix.mdx ? '' : `  - Add to astro.config: import mdx from '@astrojs/mdx'\n` +
  // Similar for markdoc and asciidoc
);
```

##### Test Cases Required:
1. **Collection Validation:**
   - ❌ Invalid collection → throws with available list
   - ✅ Valid collection → proceeds

2. **Content Type Detection:**
   - ❌ MDX without `@astrojs/mdx` → throws
   - ✅ MDX with integration → creates file
   - Similar for markdoc and asciidoc

3. **File Generation:**
   - ✅ Markdown: creates `.md` with YAML frontmatter
   - ✅ MDX: creates `.mdx` with YAML frontmatter
   - ✅ Markdoc: creates `.md` with YAML frontmatter
   - ✅ AsciiDoc: creates `.adoc` with AsciiDoc header

4. **Edge Cases:**
   - Content directory doesn't exist
   - Collection directory doesn't exist (create it)
   - File already exists (skip or error)

#### Task 3: Package Configuration

**Files to Update:**
1. `packages/nx-astro-plugin/package.json`
   - Verify `files` array includes schemas
   - Current: Already has `src/generators/**/schema.json`

2. `packages/nx-astro-plugin/generators.json`
   - Rename `generate-content` → `content`
   - Update description
   - Verify paths

3. `packages/nx-astro-plugin/project.json`
   - Verify build copies schemas
   - Current: Uses tsup + copy-assets script

#### Final Steps:

1. **Lint & Format:**
   ```bash
   jpd exec nx format:write
   jpd exec nx lint nx-astro-plugin
   jpd exec nx test nx-astro-plugin
   ```

2. **Commit Structure:**
   ```bash
   # Commit 1: Rename
   git commit -m "refactor(nx-astro-plugin): rename generate-content to content"
   
   # Commit 2: Implementation
   git commit -m "feat(nx-astro-plugin): add content generator with collection and type validation"
   
   # Commit 3: Tests
   git commit -m "test(nx-astro-plugin): add comprehensive tests for content generator"
   
   # Commit 4: Config
   git commit -m "build(nx-astro-plugin): update package config for renamed generator"
   ```

3. **Documentation (Optional):**
   - Update README with new generator usage
   - Document page generator `type` option
   - Document content generator validation

4. **Push & Finish:**
   ```bash
   git push
   # Wait for CI to pass
   git flow feature finish astro-generators-enhancements
   ```

## 🔍 Current Branch State

**Branch:** `feature/astro-generators-enhancements`
**Commits:** 1 (page generator complete)
**Tests:** All passing (131 tests)
**Coverage:** 93.28%
**CI Status:** Should pass (tests passing locally)

## 📝 Implementation Notes

### Key Design Decisions Made:

1. **Page Generator:**
   - Dynamic pages auto-bracket names
   - TODO comments guide users on customization
   - Uses real file system functions (not Nx Tree) for config parsing
   - Regex-based parsing (no eval) for security

2. **Utility Functions:**
   - `parseAstroConfigDirs()` - Tolerant regex, defaults to `src/`
   - `listContentCollections()` - Dual strategy: parse config.ts OR list directories
   - `detectContentTypeSupport()` - Checks both config files AND package.json

3. **Testing Strategy:**
   - Mock node:fs for all file operations
   - Test both happy paths and error cases
   - Verify content structure, not just file existence

### Conventions Followed:

✅ **Git Flow:** CI-centric workflow (frequent merges to develop)
✅ **Conventional Commits:** `feat/fix/refactor/test/build` with scopes
✅ **Code Style:** Go-inspired (per rules) - clear naming, minimal cleverness
✅ **Test Coverage:** Maintained above 80% threshold
✅ **Atomicity:** Each commit is self-contained and passing

## 🚀 Next Session Checklist

When you continue:

1. **Review this document** - Understand what's complete
2. **Check CI status** - Verify feature branch CI passed
3. **Read todo list** - Use `read_todos` tool to see remaining items
4. **Start with rename** - Move generate-content to content folder
5. **Follow implementation steps** - In order listed above
6. **Test incrementally** - Run tests after each major change
7. **Commit atomically** - Keep commits focused and passing

## 📚 Useful Commands

```bash
# Check current state
git status
git log --oneline -5

# Run tests
jpd exec nx test nx-astro-plugin

# Format and lint
jpd exec nx format:write
jpd exec nx lint nx-astro-plugin

# Build (if needed)
jpd exec nx build nx-astro-plugin

# View todos
# (Use read_todos tool in Warp AI)
```

## 🤝 Collaboration Notes

- All utility functions are already implemented and tested
- `detectContentTypeSupport()` is ready for content generator validation
- `listContentCollections()` is ready for collection validation
- Schema examples provided above are comprehensive
- Error message templates provided for consistency

---

**Last Updated:** 2025-10-08 18:36 UTC  
**Status:** Page Generator Complete ✅ | Content Generator Pending 📋  
**Branch:** `feature/astro-generators-enhancements`  
**Next:** Implement content generator per specifications above
