import { cpSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';

const PKG_ROOT = process.cwd(); // packages/nx-astro-plugin
const PUBLISH_ROOT = join(PKG_ROOT, '../../dist/packages/nx-astro-plugin');

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function copyDirRecursive(src, dest, filter) {
  ensureDir(dest);
  const entries = readdirSync(src);
  for (const name of entries) {
    const s = join(src, name);
    const d = join(dest, name);
    const st = statSync(s);
    const rel = s.substring(src.length + 1) || name;
    if (st.isDirectory()) {
      if (!filter || filter(s, rel, false)) {
        copyDirRecursive(s, d, filter);
      }
    } else {
      if (!filter || filter(s, rel, true)) {
        ensureDir(dirname(d));
        cpSync(s, d);
      }
    }
  }
}

// 1) Copy schema.json and any JSON under src/** to publish root under src/**
const SRC_DIR = join(PKG_ROOT, 'src');
const DEST_SRC_DIR = join(PUBLISH_ROOT, 'src');
copyDirRecursive(SRC_DIR, DEST_SRC_DIR, (abs, rel, isFile) => {
  if (!isFile) return true;
  return abs.endsWith('.json');
});

// 2) Copy generator templates (everything) under src/generators/**/templates/**
const GEN_DIR = join(SRC_DIR, 'generators');
copyDirRecursive(GEN_DIR, join(DEST_SRC_DIR, 'generators'), (abs, rel, isFile) => {
  // include only files that are inside a templates directory
  if (!isFile) return true; // traverse dirs
  const parts = abs.split(/[/\\]/g);
  return parts.includes('templates');
});

// 3) Copy top-level manifest JSON files used by Nx plugin
for (const file of ['executors.json', 'generators.json', 'README.md']) {
  const src = join(PKG_ROOT, file);
  if (existsSync(src)) {
    const dest = join(PUBLISH_ROOT, file);
    ensureDir(dirname(dest));
    cpSync(src, dest);
  }
}

// 4) Duplicate compiled JS from dist/src into src so runtime paths can omit the dist prefix
const COMPILED_SRC = join(PUBLISH_ROOT, 'dist', 'src');
copyDirRecursive(COMPILED_SRC, join(PUBLISH_ROOT, 'src'), (abs, rel, isFile) => {
  if (!isFile) return true;
  return abs.endsWith('.js') || abs.endsWith('.js.map');
});

console.log('Copied assets to', PUBLISH_ROOT);
