import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export function projectAstroConfigPath(projectRoot: string): string | null {
  const cands = ['astro.config.ts', 'astro.config.mjs', 'astro.config.js'];
  for (const f of cands) {
    const p = join(projectRoot, f);
    if (existsSync(p)) return p;
  }
  return null;
}

export function detectIntegrations(projectRoot: string): string[] {
  const cfg = projectAstroConfigPath(projectRoot);
  if (!cfg) return [];
  const content = readFileSync(cfg, 'utf8');
  const matches = [...content.matchAll(/@astrojs\/(\w+)/g)].map((m) => m[1]).filter(Boolean) as string[];
  return Array.from(new Set(matches)) as string[];
}

export function ensureIntegrationsArray(content: string): string {
  // Simple heuristic: ensure integrations: [] exists
  if (/integrations\s*:\s*\[/.test(content)) return content;
  return content.replace(/defineConfig\(\{/, 'defineConfig({\n  integrations: [],');
}

export function writeConfig(path: string, content: string) {
  writeFileSync(path, content, 'utf8');
}

export interface AstroConfigDirs {
  srcDir: string;
  pagesDir: string;
  contentDir: string;
}

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

export function detectContentTypeSupport(projectRoot: string): ContentTypeSupport {
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

export function listContentCollections(projectRoot: string): string[] {
  const { contentDir } = parseAstroConfigDirs(projectRoot);
  const fullPath = join(projectRoot, contentDir);

  if (!existsSync(fullPath)) return [];

  const configPath = join(fullPath, 'config.ts');
  const collections: string[] = [];

  // Strategy A: Parse config.ts for defineCollection keys
  if (existsSync(configPath)) {
    const content = readFileSync(configPath, 'utf8');
    const collectionsMatch = content.match(
      /collections\s*:\s*\{([\s\S]*?)\}/
    );
    if (collectionsMatch) {
      const collectionsBlock = collectionsMatch[1];
      const keyMatches = collectionsBlock.matchAll(/['"` ]([a-zA-Z0-9_-]+)['"` ]\s*:/g);
      for (const m of keyMatches) {
        if (m[1]) collections.push(m[1]);
      }
    }
  }

  // Strategy B: List directories
  const { readdirSync, statSync } = require('node:fs');
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
