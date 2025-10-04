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
  const matches = [...content.matchAll(/@astrojs\/(\w+)/g)].map((m) => m[1]);
  return Array.from(new Set(matches));
}

export function ensureIntegrationsArray(content: string): string {
  // Simple heuristic: ensure integrations: [] exists
  if (/integrations\s*:\s*\[/.test(content)) return content;
  return content.replace(/defineConfig\(\{/, 'defineConfig({\n  integrations: [],');
}

export function writeConfig(path: string, content: string) {
  writeFileSync(path, content, 'utf8');
}