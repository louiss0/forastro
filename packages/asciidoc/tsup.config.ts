import { defineConfig } from 'tsup';
import fs from 'node:fs';
import {
  createPackageJsonSchema,
  transformPackageJSON_ExportsForBuild,
  type PackageJSON,
} from '../../shared/generateNewPackageJSON';

const BUILD_REGEX_STRING = '^tsup$';
const BUILD_REGEX_MESSAGE =
  "The 'build' script must be 'tsup' to build in the current directory.";

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
    'index': './src/index.ts',
    'lib/unocss': './src/lib/unocss.ts',
    'lib/tailwind': './src/lib/tailwind.ts'
  },
  outDir: '.', // Output to current directory
  format: ['esm'],
  dts: true, // Generate .d.ts files
  minify: true,
  clean: false, // Don't clean since we're outputting to current directory
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
          'package.json',
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
