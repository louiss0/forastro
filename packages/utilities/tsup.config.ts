import { defineConfig } from 'tsup';
import fs from 'node:fs';
import z from 'zod';

const PackageJsonSchema = z.object({
  name: z.string(),
  version: z.string(),
  peerDependencies: z.record(z.string(), z.string()),
  publishConfig: z.object({
    access: z.literal('public'),
  }),
  scripts: z.object({
    build: z
      .string()
      .regex(
        /^tsup\s+--outDir\s+(?:\.*\/)*[a-z]+(?:\/[a-z]+)+/,
        "The 'build' script must be in the format 'tsup --outDir <path>', where <path> must contain at least two lowercase letter segments (e.g., 'dist/esm' or './lib/bundle'), and can optionally start with a relative path prefix (like './' or '../') or a root slash.",
      ),
  }),
  dependencies: z.record(z.string(), z.string()).optional(),
  optionalDependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()),
  type: z.literal('module'),
  main: z.string(),
  exports: z.record(
    z.string(),
    z.union([
      z.string(),
      z.object({
        types: z.string().optional(), // types field is optional
        import: z.string(),
      }),
    ]),
  ),
  author: z.object({
    name: z.string(),
    url: z.string().url(),
  }),
  bugs: z.object({
    url: z.string().url(),
    email: z.string().email(),
  }),
  homepage: z.string().url(),
  repository: z.object({
    directory: z.string(),
    type: z.literal('git'),
    url: z.string().url(),
  }),
  keywords: z.array(z.string()),
  files: z.array(z.string()),
});

export default defineConfig((ctx) => ({
  entry: ['./src/index.ts'],
  format: ['esm'],
  dts: true, // Generate .d.ts files
  minify: true,
  clean: true, // Clean output directory before building
  publicDir: true,
  async onSuccess() {
    fs.readFile(
      'package.json',
      { encoding: 'utf-8', flag: 'r' },
      function (err, data) {
        if (err) throw err;

        const packageJSON = PackageJsonSchema.parse(JSON.parse(data));
        const newPackageJSON = Object.fromEntries(
          Object.entries(packageJSON).map(([key, value]) => {
            return key === 'exports'
              ? [
                  key,
                  removeSrcPrefixFromExportsValuesIfObjectRemoveSrcFromImportsValue(
                    value as Record<
                      string,
                      string | { import: string; types?: string }
                    >,
                  ),
                ]
              : [key, value];

            function removeSrcPrefixFromExportsValuesIfObjectRemoveSrcFromImportsValue(
              value: Record<
                string,
                string | { import: string; types?: string }
              >,
            ): Record<string, unknown> {
              return Object.fromEntries(
                Object.entries(value).map(([key, value]) => [
                  key,
                  typeof value === 'string'
                    ? value.replace(/^\.\/src/, '')
                    : {
                        import: value.import.replace(/^\.\/src/, '.'),
                        types: value.types,
                      },
                ]),
              );
            }
          }),
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
