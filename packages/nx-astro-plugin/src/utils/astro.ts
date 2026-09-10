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

  // Check Astro config for integrations.
  const cfg = projectAstroConfigPath(projectRoot);
  const configContent = cfg ? readFileSync(cfg, 'utf8') : '';
  if (/@astrojs\/mdx/.test(configContent)) support.mdx = true;
  if (/@astrojs\/markdoc/.test(configContent)) support.markdoc = true;
  if (/@forastro\/asciidoc/.test(configContent)) support.asciidoc = true;

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
      allDeps['@astrolib/asciidoc'] ||
      allDeps['@forastro/asciidoc']
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
 * 1. Parses Astro 7's content.config.ts and the legacy config.ts for collection names
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
  const { srcDir, contentDir } = parseAstroConfigDirs(projectRoot);
  const contentDirectory = join(projectRoot, contentDir);
  const configPaths = [
    join(projectRoot, srcDir, 'content.config.ts'),
    join(contentDirectory, 'config.ts'),
  ];
  const collections = new Set<string>();

  for (const configPath of configPaths) {
    if (!existsSync(configPath)) continue;

    const content = readFileSync(configPath, 'utf8');
    const collectionsMatch = content.match(
      /collections\s*(?::[^={]+)?\s*=?\s*\{([\s\S]*?)\}/,
    );
    const collectionsBlock = collectionsMatch?.[1] ?? '';
    for (const match of collectionsBlock.matchAll(
      /(?:^|[,\n])\s*['"`]?(?<name>[a-zA-Z0-9_-]+)['"`]?\s*:/g,
    )) {
      if (match.groups?.name) collections.add(match.groups.name);
    }
  }

  // Directory-backed collections remain valid in Astro, including projects
  // that have not yet migrated their collection definitions to Astro 7.
  if (existsSync(contentDirectory)) {
    try {
      for (const entry of readdirSync(contentDirectory)) {
        if (statSync(join(contentDirectory, entry)).isDirectory()) {
          collections.add(entry);
        }
      }
    } catch {
      // A missing or unreadable content directory has no directory collections.
    }
  }

  return Array.from(collections).sort();
}
