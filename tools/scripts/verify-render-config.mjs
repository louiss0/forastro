import { readFile } from 'node:fs/promises';

const blueprintPath = new URL('../../render.yaml', import.meta.url);
const requiredSettings = new Map([
  ['a static-site runtime', /^\s*runtime:\s*static\s*$/m],
  ['the repository root', /^\s*rootDir:\s*\.\s*$/m],
  [
    'the locked pnpm build command',
    /^\s*buildCommand:\s*corepack pnpm install --frozen-lockfile && corepack pnpm nx build docs\s*$/m,
  ],
  [
    'the docs build output',
    /^\s*staticPublishPath:\s*\.\/apps\/docs\/dist\s*$/m,
  ],
]);

const blueprint = await readFile(blueprintPath, 'utf8').catch(() => '');
const missingSettings = [...requiredSettings]
  .filter(([, pattern]) => !pattern.test(blueprint))
  .map(([description]) => description);

if (missingSettings.length > 0) {
  throw new Error(
    `Render configuration is missing: ${missingSettings.join(', ')}`,
  );
}

console.log('Verified Render uses the workspace pnpm lockfile');
