import { defineConfig } from 'tsup';
import fs from 'node:fs';
import path from 'node:path';
import {
  createPackageJsonSchema,
  transformPackageJSON_ExportsForBuild,
  type PackageJSON,
} from '../../shared/generateNewPackageJSON';

const BUILD_REGEX_STRING =
  '^tsup\\s+--outDir\\s+(?:\\.*\\/)*[a-z]+(?:\\/[a-z]+)+';
const BUILD_REGEX_MESSAGE =
  "The 'build' script must be in the format 'tsup --outDir <path>', where <path> must contain at least two lowercase letter segments (e.g., 'dist/esm' or './lib/bundle'), and can optionally start with a relative path prefix (like './' or '../') or a root slash.";

const PackageJsonSchemaResult = createPackageJsonSchema(
  BUILD_REGEX_STRING,
  BUILD_REGEX_MESSAGE,
);

if (PackageJsonSchemaResult instanceof Error) {
  throw PackageJsonSchemaResult;
}

const PackageJsonSchema = PackageJsonSchemaResult;

export default defineConfig((ctx) => ({
  entry: ['./src/index.ts'],
  format: ['esm'],
  dts: true,
  minify: true,
  clean: true,
  async onSuccess() {
    const outputDirectory = path.resolve(ctx.outDir);
    const packageJSON: PackageJSON = PackageJsonSchema.parse(
      JSON.parse(fs.readFileSync('package.json', 'utf-8')),
    );
    const newPackageJSON = transformPackageJSON_ExportsForBuild(
      packageJSON,
      [],
    );
    newPackageJSON.exports['./components'] = {
      import: './components/index.js',
    };

    // Astro components are publishable assets rather than tsup entry points.
    // Copy them beside a JavaScript barrel so the declared subpath exists in
    // both the dist directory and the packed tarball.
    const sourceComponentsDirectory = path.resolve('public/components');
    const outputComponentsDirectory = path.join(outputDirectory, 'components');
    fs.cpSync(sourceComponentsDirectory, outputComponentsDirectory, {
      recursive: true,
    });
    fs.renameSync(
      path.join(outputComponentsDirectory, 'index.ts'),
      path.join(outputComponentsDirectory, 'index.js'),
    );

    fs.copyFileSync(
      path.resolve('public/README.md'),
      path.join(outputDirectory, 'README.md'),
    );
    fs.copyFileSync(
      path.resolve('CHANGELOG.md'),
      path.join(outputDirectory, 'CHANGELOG.md'),
    );
    fs.copyFileSync(
      path.resolve('../../LICENSE'),
      path.join(outputDirectory, 'LICENSE'),
    );
    fs.writeFileSync(
      path.join(outputDirectory, 'package.json'),
      JSON.stringify(newPackageJSON, null, 2),
      'utf-8',
    );
  },
}));
