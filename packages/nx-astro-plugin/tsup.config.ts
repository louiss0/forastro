import { defineConfig } from 'tsup';
import fs from 'node:fs';
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
  dts: false, // TODO: Fix type import issues with verbatimModuleSyntax
  minify: true,
  clean: true, // Clean output directory before building
  publicDir: true,
  splitting: false, // Disable code splitting to prevent chunking
  async onSuccess() {
    // Copy plugin.json and README.md assets
    const assets = ['plugin.json', 'README.md'];
    for (const asset of assets) {
      if (fs.existsSync(asset)) {
        fs.copyFileSync(asset, `${ctx.outDir}/${asset}`);
      }
    }

    fs.readFile(
      'package.json',
      { encoding: 'utf-8', flag: 'r' },
      function (err, data) {
        if (err) throw err;

        const packageJSON: PackageJSON = PackageJsonSchema.parse(
          JSON.parse(data),
        );

        const newPackageJSON: PackageJSON =
          transformPackageJSON_ExportsForBuild(packageJSON, []);

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
