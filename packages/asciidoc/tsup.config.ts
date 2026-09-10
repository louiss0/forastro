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
  "The 'build' script must be in the format 'tsup --outDir <path>', where <path> must contain at least two lowercase letter segments.";

const PackageJsonSchemaResult = createPackageJsonSchema(
  BUILD_REGEX_STRING,
  BUILD_REGEX_MESSAGE,
);

if (PackageJsonSchemaResult instanceof Error) {
  throw new Error(
    `Failed to initialize PackageJsonSchema: ${PackageJsonSchemaResult.message}`,
  );
}

const PackageJsonSchema = PackageJsonSchemaResult;

export default defineConfig((ctx) => ({
  entry: {
    index: './src/index.ts',
    'lib/unocss': './src/lib/unocss.ts',
    'lib/tailwind': './src/lib/tailwind.ts',
  },
  outDir: '../../dist/packages/asciidoc', // Output to dist folder
  format: ['esm'],
  dts: true, // Generate .d.ts files
  minify: true,
  clean: true, // Clean dist folder
  external: ['asciidoctor'],
  publicDir: true,
  splitting: false, // Disable code splitting to prevent chunking
  async onSuccess() {
    const packageJSON: PackageJSON = PackageJsonSchema.parse(
      JSON.parse(fs.readFileSync('package.json', 'utf-8')),
    );
    const newPackageJSON = transformPackageJSON_ExportsForBuild(
      packageJSON,
      [],
    );

    fs.copyFileSync(
      path.resolve('../../LICENSE'),
      path.join(ctx.outDir, 'LICENSE'),
    );
    fs.writeFileSync(
      path.join(ctx.outDir, 'package.json'),
      JSON.stringify(newPackageJSON, null, 2),
      'utf-8',
    );
  },
}));
