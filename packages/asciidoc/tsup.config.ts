import { defineConfig } from 'tsup';
import fs from 'node:fs';
import {
  createPackageJsonSchema,
  transformPackageJSON_ExportsForBuild,
  PackageJSON,
} from '../../shared/generateNewPackageJSON';

const BUILD_SCRIPT_REGEX_STRING =
  '^tsup\\s+--outDir\\s+(?:\\.*\\/)*[a-z]+(?:\\/[a-z]+)+';
const BUILD_SCRIPT_REGEX_MESSAGE =
  "The 'build' script must be in the format 'tsup --outDir <path>', where <path> must contain at least two lowercase letter segments (e.g., 'dist/esm' or './lib/bundle'), and can optionally start with a relative path prefix (like './' or '../') or a root slash.";

const PackageJsonSchemaResult = createPackageJsonSchema(
  BUILD_SCRIPT_REGEX_STRING,
  BUILD_SCRIPT_REGEX_MESSAGE,
);

if (PackageJsonSchemaResult instanceof Error) {
  throw new Error(
    `Failed to initialize PackageJsonSchema: ${PackageJsonSchemaResult.message}`,
  );
}

const PackageJsonSchema = PackageJsonSchemaResult;

export default defineConfig((ctx) => ({
  entry: {
    'index': './src/index.ts',
    'lib/unocss': './src/lib/unocss.ts',
    'lib/tailwind': './src/lib/tailwind.ts'
  },
  format: ['esm'],
  dts: true, // Generate .d.ts files
  minify: true,
  clean: true, // Clean output directory before building
  external: ['asciidoctor'],
  publicDir: true,
  splitting: false, // Disable code splitting to prevent chunking
  async onSuccess() {
    fs.readFile(
      'package.json',
      { encoding: 'utf-8', flag: 'r' },
      function (err, data) {
        if (err) throw err;

        const packageJSON: PackageJSON = PackageJsonSchema.parse(
          JSON.parse(data),
        );

        const valuesToIgnoreInExports: string[] = []; // This remains empty as per original code

        // Use the shared transformation function
        const newPackageJSON = transformPackageJSON_ExportsForBuild(
          packageJSON,
          valuesToIgnoreInExports,
        );

        fs.writeFile(
          `${ctx.outDir}/package.json`,
          JSON.stringify(newPackageJSON, null, 2),
          { encoding: 'utf-8', flag: 'w' },
          function (err) {
            if (err) throw err;
          },
        );
      },
    );
  },
}));
