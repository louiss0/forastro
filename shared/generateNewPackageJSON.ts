import { z } from 'astro/zod';

export function createPackageJsonSchema(
  buildRegexString: string,
  buildRegexMessage: string,
) {
  let buildRegex: RegExp;
  try {
    buildRegex = new RegExp(buildRegexString);
  } catch (error: unknown) {
    return new Error(
      `Invalid regular expression provided for 'build' field: ${(error as Error).message}`,
    );
  }

  return z.object({
    name: z.string(),
    version: z.string(),
    peerDependencies: z.record(z.string(), z.string()),
    publishConfig: z.object({
      access: z.literal('public'),
    }),
    scripts: z.object({
      build: z.string().regex(buildRegex, buildRegexMessage),
    }),
    dependencies: z.record(z.string(), z.string()),
    optionalDependencies: z.record(z.string(), z.string()).optional(),
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
    devDependencies: z.record(z.string(), z.string()).optional(),
  });
}

export type PackageJSON = z.infer<
  Exclude<ReturnType<typeof createPackageJsonSchema>, Error>
>;

export function transformPackageJSON_ExportsForBuild(
  data: PackageJSON,
  valuesToIgnoreInExports: string[],
) {
  function removeSrcPrefixFromExportsValuesIfObjectRemoveSrcFromImportsValue(
    value: PackageJSON['exports'],
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

  const newPackageJSON: PackageJSON = Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      return key === 'exports'
        ? [
            key,
            removeSrcPrefixFromExportsValuesIfObjectRemoveSrcFromImportsValue(
              value as PackageJSON['exports'],
            ),
          ]
        : [key, value];
    }),
  );

  function replaceTsWithJsInExportsIfValueIsStringIfObjectReplaceImportsProp(
    exportsField: PackageJSON['exports'],
    keysToIgnore: string[],
  ): Record<string, string | { import: string; types?: string }> {
    const transformedExports: Record<
      string,
      string | { import: string; types?: string }
    > = {};

    for (const [key, value] of Object.entries(exportsField)) {
      if (typeof value === 'string') {
        //If the string value is in the ignore list, keep it as is.
        // Otherwise, replace .ts with .js at the end of the string.
        transformedExports[key] = keysToIgnore.includes(key)
          ? value
          : value.replace(/\.ts$/, '.js');
      } else {
        // Handle object type: { import: string, types?: string }
        // Apply transformation to 'import' field
        const newImport = keysToIgnore.includes(key)
          ? value.import
          : value.import.replace(/\.ts$/, '.js');

        transformedExports[key] = {
          types: value.types,
          import: newImport,
        };
      }
    }
    return transformedExports;
  }

  // Apply the transformation to the 'exports' field of the newPackageJSON
  newPackageJSON.exports =
    replaceTsWithJsInExportsIfValueIsStringIfObjectReplaceImportsProp(
      newPackageJSON.exports,
      valuesToIgnoreInExports,
    );
  return newPackageJSON;
}
