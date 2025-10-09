import { cpSync, mkdirSync, existsSync, readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

// Flatten build structure - NO src/ folder in output
// Everything goes to dist root: generators/, executors/, utils/, etc.

const PKG_ROOT = process.cwd(); // packages/nx-astro-plugin
const PUBLISH_ROOT = join(PKG_ROOT, '../../dist/packages/nx-astro-plugin');
const SRC_DIR = join(PKG_ROOT, 'src');

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

// 1) Copy schema.json files to generators/**/schema.json and executors/**/schema.json
copyDirRecursive(join(SRC_DIR, 'generators'), join(PUBLISH_ROOT, 'generators'), (abs, rel, isFile) => {
  if (!isFile) return true;
  return abs.endsWith('schema.json');
});

copyDirRecursive(join(SRC_DIR, 'executors'), join(PUBLISH_ROOT, 'executors'), (abs, rel, isFile) => {
  if (!isFile) return true;
  return abs.endsWith('schema.json');
});

// 2) Copy generator templates to generators/**/templates/**
copyDirRecursive(join(SRC_DIR, 'generators'), join(PUBLISH_ROOT, 'generators'), (abs, rel, isFile) => {
  if (!isFile) return true;
  const parts = abs.split(/[/\\]/g);
  return parts.includes('templates');
});

// 3) Copy top-level manifest files
for (const file of ['executors.json', 'generators.json', 'README.md']) {
  const src = join(PKG_ROOT, file);
  if (existsSync(src)) {
    cpSync(src, join(PUBLISH_ROOT, file));
  }
}

// 4) Copy package.json
const pkg = JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf-8'));
writeFileSync(join(PUBLISH_ROOT, 'package.json'), JSON.stringify(pkg, null, 2), 'utf-8');

console.log('✓ Build complete!');
console.log('  • Compiled JS: dist/packages/nx-astro-plugin/');
console.log('  • Schemas: generators/**/schema.json, executors/**/schema.json');
console.log('  • Templates: generators/**/templates/');
console.log('  • Structure: FLATTENED (no src/ folder)');
