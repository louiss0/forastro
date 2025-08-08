import { mkdir, cp } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const src = resolve(process.cwd(), 'src/components');
const dest = resolve(process.cwd(), 'dist/components');

await mkdir(dest, { recursive: true });
// Copy .astro files preserving filenames
await cp(src, dest, { recursive: true, force: true });

console.log(`[copy-astro] Copied components from ${src} to ${dest}`);

