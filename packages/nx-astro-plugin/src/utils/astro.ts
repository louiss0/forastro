import {
  existsSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { join } from 'node:path';

/**
 * Find the Astro configuration file in a project.
 *
 * Checks for astro.config.ts, astro.config.mjs, and astro.config.js in the project root.
 *
 * @param projectRoot - Absolute path to the project root directory
 * @returns Path to the config file, or null if not found
 *
 * @example
 * const configPath = projectAstroConfigPath('/workspace/apps/my-site');
 * // Returns: '/workspace/apps/my-site/astro.config.ts' (if it exists)
 */
export function projectAstroConfigPath(projectRoot: string): string | null {
  const cands = ['astro.config.ts', 'astro.config.mjs', 'astro.config.js'];
  for (const f of cands) {
    const p = join(projectRoot, f);
    if (existsSync(p)) return p;
  }
  return null;
}

/**
 * Detect installed Astro integrations from the config file.
 *
 * Uses regex to find @astrojs/* imports in the Astro config file.
 *
 * @param projectRoot - Absolute path to the project root directory
 * @returns Array of integration names (e.g., ['react', 'mdx', 'tailwind'])
 *
 * @example
 * const integrations = detectIntegrations('/workspace/apps/my-site');
 * // Returns: ['react', 'mdx'] if those integrations are installed
 */
export function detectIntegrations(projectRoot: string): string[] {
  const cfg = projectAstroConfigPath(projectRoot);
  if (!cfg) return [];
  const content = readFileSync(cfg, 'utf8');
  const matches = [...content.matchAll(/@astrojs\/(\w+)/g)]
    .map((m) => m[1])
    .filter(Boolean) as string[];
  return Array.from(new Set(matches)) as string[];
}

export function ensureIntegrationsArray(content: string): string {
  // Simple heuristic: ensure integrations: [] exists
  if (/integrations\s*:\s*\[/.test(content)) return content;
  return content.replace(
    /defineConfig\(\{/,
    'defineConfig({\n  integrations: [],',
  );
}

export function writeConfig(path: string, content: string) {
  writeFileSync(path, content, 'utf8');
}

export interface AstroConfigDirs {
  srcDir: string;
  pagesDir: string;
  contentDir: string;
}

/**
 * Parse Astro config to extract directory paths.
 *
 * Reads the Astro config file to determine the srcDir, and derives
 * the pagesDir and contentDir from it.
 *
 * @param projectRoot - Absolute path to the project root directory
 * @returns Object containing srcDir, pagesDir, and contentDir paths
 *
 * @example
 * const dirs = parseAstroConfigDirs('/workspace/apps/my-site');
 * // Returns: { srcDir: 'src', pagesDir: 'src/pages', contentDir: 'src/content' }
 */
export function parseAstroConfigDirs(projectRoot: string): AstroConfigDirs {
  const cfg = projectAstroConfigPath(projectRoot);
  let srcDir = 'src';

  if (cfg) {
    const content = readFileSync(cfg, 'utf8');
    const srcMatch = content.match(/srcDir\s*:\s*['"`]([^'"` ]+)['"`]/);
    if (srcMatch && srcMatch[1]) {
      srcDir = srcMatch[1].replace(/\\/g, '/');
    }
  }

  return {
    srcDir,
    pagesDir: `${srcDir}/pages`,
    contentDir: `${srcDir}/content`,
  };
}

export interface ContentTypeSupport {
  markdown: boolean;
  mdx: boolean;
  markdoc: boolean;
  asciidoc: boolean;
}

/**
 * Detect which content types are supported in the project.
 *
 * Checks both the Astro config and package.json to determine if MDX, Markdoc,
 * and AsciiDoc integrations are installed. Markdown is always available.
 *
 * @param projectRoot - Absolute path to the project root directory
 * @returns Object indicating which content types are supported
 *
 * @example
 * const support = detectContentTypeSupport('/workspace/apps/my-site');
 * // Returns: { markdown: true, mdx: true, markdoc: false, asciidoc: false }
 */
export function detectContentTypeSupport(
  projectRoot: string,
): ContentTypeSupport {
  const support: ContentTypeSupport = {
    markdown: true, // Always available in Astro
    mdx: false,
    markdoc: false,
    asciidoc: false,
  };

  // Check astro config for integrations
  const cfg = projectAstroConfigPath(projectRoot);
  if (cfg) {
    const content = readFileSync(cfg, 'utf8');
    if (/@astrojs\/mdx/.test(content)) support.mdx = true;
    if (/@astrojs\/markdoc/.test(content)) support.markdoc = true;
  }

  // Check package.json for dependencies
  const pkgPath = join(projectRoot, 'package.json');
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };

    if (allDeps['@astrojs/mdx']) support.mdx = true;
    if (allDeps['@astrojs/markdoc']) support.markdoc = true;
    if (
      allDeps['asciidoctor'] ||
      allDeps['astro-asciidoc'] ||
      allDeps['@astrolib/asciidoc']
    ) {
      support.asciidoc = true;
    }
  }

  return support;
}

/**
 * List all content collections in the project.
 *
 * Uses a dual-strategy approach:
 * 1. Parses config.ts to find collection names in the collections object
 * 2. Lists directories in the content folder
 *
 * @param projectRoot - Absolute path to the project root directory
 * @returns Sorted array of collection names
 *
 * @example
 * const collections = listContentCollections('/workspace/apps/my-site');
 * // Returns: ['blog', 'docs', 'posts']
 */
export function listContentCollections(projectRoot: string): string[] {
  const { contentDir } = parseAstroConfigDirs(projectRoot);
  const fullPath = join(projectRoot, contentDir);

  if (!existsSync(fullPath)) return [];

  const configPath = join(fullPath, 'config.ts');
  const collections: string[] = [];

  // Strategy A: Parse config.ts for defineCollection keys
  if (existsSync(configPath)) {
    const content = readFileSync(configPath, 'utf8');
    const collectionsMatch = content.match(/collections\s*:\s*\{([\s\S]*?)\}/);
    if (collectionsMatch) {
      const collectionsBlock = collectionsMatch[1];
      const keyMatches = collectionsBlock.matchAll(
        /['"` ]([a-zA-Z0-9_-]+)['"` ]\s*:/g,
      );
      for (const m of keyMatches) {
        if (m[1]) collections.push(m[1]);
      }
    }
  }

  // Strategy B: List directories
  try {
    const entries = readdirSync(fullPath);
    for (const entry of entries) {
      const entryPath = join(fullPath, entry);
      if (statSync(entryPath).isDirectory()) {
        if (!collections.includes(entry)) {
          collections.push(entry);
        }
      }
    }
  } catch {
    // Ignore errors
  }

  return Array.from(new Set(collections)).sort();
}
