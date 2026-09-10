import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const workspaceRoot = resolve(import.meta.dirname, '../..');
mkdirSync(join(workspaceRoot, 'tmp'), { recursive: true });
const packageNames = ['utilities', 'asciidoc', 'nx-astro-plugin'];
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const verificationRoot = mkdtempSync(join(workspaceRoot, 'tmp', 'packed-'));

try {
  for (const packageName of packageNames) {
    const packageDirectory = join(
      workspaceRoot,
      'dist',
      'packages',
      packageName,
    );
    if (!existsSync(packageDirectory)) {
      throw new Error(`Build output is missing: ${packageDirectory}`);
    }

    const packageManifest = JSON.parse(
      readFileSync(join(packageDirectory, 'package.json'), 'utf8'),
    );
    const requiredFiles = [
      packageManifest.main,
      'README.md',
      'LICENSE',
      ...(packageName === 'utilities' ? ['index.d.ts'] : []),
    ];
    for (const requiredFile of requiredFiles) {
      if (requiredFile && !existsSync(join(packageDirectory, requiredFile))) {
        throw new Error(`${packageName} is missing ${requiredFile}`);
      }
    }

    const packageTarballDirectory = join(verificationRoot, packageName);
    mkdirSync(packageTarballDirectory, { recursive: true });
    const packResult = JSON.parse(
      execFileSync(
        npmCommand,
        ['pack', '--json', '--pack-destination', packageTarballDirectory],
        {
          cwd: packageDirectory,
          encoding: 'utf8',
          shell: process.platform === 'win32',
        },
      ),
    );
    const tarball = packResult[0]?.filename;
    if (!tarball)
      throw new Error(`npm pack returned no tarball for ${packageName}`);

    execFileSync('tar', [
      '-xzf',
      join(packageTarballDirectory, tarball),
      '-C',
      packageTarballDirectory,
    ]);
    const packedRoot = join(packageTarballDirectory, 'package');
    if (packageName === 'utilities') {
      const imported = await import(
        `${pathToFileURL(join(packedRoot, 'index.js')).href}?packed-test`
      );
      if (imported.executeIf(false, () => 'unexpected') !== undefined) {
        throw new Error('Packed utilities entry point behaved incorrectly');
      }
      if (!existsSync(join(packedRoot, 'components', 'index.js'))) {
        throw new Error('Packed utilities components entry point is missing');
      }
    }

    console.log(`Verified packed ${packageName}`);
  }
} finally {
  rmSync(verificationRoot, { recursive: true, force: true });
}
