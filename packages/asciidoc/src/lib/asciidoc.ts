import { type Loader } from 'astro/loaders';
import {
  asciidocConfigObjectSchema,
  AsciidocProcessorController,
  generateSlug,
  getAsciidocPaths,
  loadAsciidocConfig,
} from './internal';
import { z } from 'astro/zod';
import type { Document } from 'asciidoctor';

export type AsciidocConfigObject = z.infer<typeof asciidocConfigObjectSchema>;

const CSV_LIST_REGEX = /^(?:[a-zA-Z0-9_-]+,\s*|[a-zA-Z0-9_-]+(?:,\s+[a-zA-Z0-9_-]+)+,?)$/;

export type DocumentAttributes = Record<string, unknown>;

/**
 * Normalizes AsciiDoc attributes prior to schema validation.
 * 
 * Transformations:
 * - Empty strings ("") → true (common AsciiDoc pattern for boolean attributes)
 * - Strings matching CSV pattern → string[] (comma-split, trimmed, empties removed)
 * - Convert dash-case/snake_case keys → camelCase keys
 * 
 * The CSV pattern matches:
 * - Single token + comma: "foo," or "foo,   " → ["foo"]
 * - Multiple tokens with spaces: "foo, bar, baz," → ["foo", "bar", "baz"]
 * - Does NOT match "foo,bar" (no space after comma)
 * 
 * Key conversion examples:
 * - "user-name" → "userName"
 * - "api_key" → "apiKey"
 * - "simple" → "simple" (no change)
 * 
 * @param input - Raw attributes from document.getAttributes()
 * @returns New object with normalized attribute values and camelCase keys (non-mutating)
 */
export function normalizeAsciiDocAttributes(input: DocumentAttributes): DocumentAttributes {
  const out: DocumentAttributes = {};
  
  for (const [key, value] of Object.entries(input)) {
    // Convert dash-case/snake_case keys to camelCase
    const camelCaseKey = key.replace(/[-_]([a-z])/g, (_, letter) => letter.toUpperCase());
    
    if (value === "") {
      out[camelCaseKey] = true;
      continue;
    }
    if (typeof value === "string" && CSV_LIST_REGEX.test(value)) {
      out[camelCaseKey] = value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      continue;
    }
    out[camelCaseKey] = value;
  }
  
  return out;
}

class FilePathAndSlug {
  constructor(
    public readonly pathRelativeToRoot: string,
    public readonly slug: string,
  ) {}
}

let asciidocConfig: AsciidocConfigObject | undefined;

export function asciidocLoader(contentFolderName: string) {
  const asciidocProcessorController = new AsciidocProcessorController();

  return {
    name: 'forastro/asciidoc-loader',
    async load(context) {
      const contentFolderNameSchema = z.string().regex(
        /\w+(?:\/\w+)*/,
        `A content folder name must be a string with word characters at the front only.
   Ex: content
   When referring to deeply nested folders in the project make sure you place a forward slash
   before each folder name after the parent folder name.
   Ex: src/content

   No spaces or special characters.
   `,
      );

      contentFolderNameSchema.parse(contentFolderName);

      const {
        store,
        config: astroConfig,
        generateDigest,
        logger,
        collection,
        parseData,
        watcher,
      } = context;

      logger.info('Loading Asciidoc paths and config file');

      // Get the absolute path from astroConfig.root.pathname
      // This works in both Node.js and Deno environments
      const resolvedRootRepo = astroConfig.root.pathname;

      asciidocConfig =
        asciidocConfig ?? (await loadAsciidocConfig(resolvedRootRepo));

      const asciidocFilePaths = await getAsciidocPaths(
        `${resolvedRootRepo}/${contentFolderName}/${collection}`,
      );

      switch (asciidocConfig.attributes?.sourceHighlighter) {
        case 'shiki':
          if (asciidocConfig.attributes?.shikiTheme) {
            await asciidocProcessorController.registerShiki(
              asciidocConfig.attributes.shikiTheme,
            );
          } else {
            logger.error(
              'Shiki theme not configured when sourceHighlighter is "shiki".',
            );
          }
          break;

        case 'prism':
          if ('prismLanguages' in asciidocConfig.attributes) {
            asciidocProcessorController.registerPrism_JS(
              asciidocConfig.attributes.prismLanguages,
            );
          } else {
            logger.error(
              'Prism languages not configured when sourceHighlighter is "prism".',
            );
          }
          break;
      }
      if (Object.keys(asciidocConfig).length !== 0) {
        logger.info(`Creating Asciidoc Registry from using config file`);

        asciidocProcessorController.registerBlocksAndMacrosFromConfig(
          asciidocConfig.blocks,
          asciidocConfig.macros,
        );
      }

      logger.info('Clearing the store');

      store.clear();

      logger.info('Extracting data from files then storing it');

      const fileNameToSlugMap = new Map<string, FilePathAndSlug>();

      const fileNameRE = /(?<filename>[\w\s\d-]+)(?<extension>\.[a-z]+)$/;

      for (const path of asciidocFilePaths) {
        const fullFilePathMatch = path.match(fileNameRE);

        if (!fullFilePathMatch) {
          throw Error(`This path isn't correct.
                         A folder can use any set of characters but must end in a forward slash.
                         A filename must use word characters digits and whitespace no other characters.
                        `);
        }

        const filename = fullFilePathMatch.groups?.['filename'] ?? '';

        if (!filename) {
          throw Error(
            'There should be a word called filename in the word group',
          );
        }

        const pathPrefixedWithFolderName = `${contentFolderName}/${collection}/${path}`;

        const document = asciidocProcessorController.loadFileWithAttributes(
          `${resolvedRootRepo}/${pathPrefixedWithFolderName}`,
          asciidocConfig.attributes,
        );

        const sluggedFilename = generateSlug(filename);

        await setStoreUsingExtractedInfo(
          pathPrefixedWithFolderName,
          sluggedFilename,
          document,
        );

        fileNameToSlugMap.set(
          filename,
          new FilePathAndSlug(pathPrefixedWithFolderName, sluggedFilename),
        );
      }

      const SUPPORTED_ASCIIDOC_FILE_EXTENSIONS = ['.adoc', '.asciidoc'];

      watcher?.on('add', async (path) => {
        const pathEndsWithOneOfTheSupportedAsciidocExtensions =
          SUPPORTED_ASCIIDOC_FILE_EXTENSIONS.some((ext) => path.endsWith(ext));

        if (!pathEndsWithOneOfTheSupportedAsciidocExtensions) return;

        const fullFilePathMatch = path.match(fileNameRE);

        if (!fullFilePathMatch) {
          throw Error(`This path ${path} isn't correct.
                         A folder can use any set of characters but must end in a forward slash.
                         A filename must use word characters digits and whitespace no other characters.
                        `);
        }

        logger.info(
          `You added this file ${path} it's info will be now parsed an added to the store`,
        );

        const filename = fullFilePathMatch.groups?.['filename'] ?? '';

        if (!filename) {
          throw Error(
            'There should be a word called filename in the word group',
          );
        }

        const extractPath = (filePath: string, targetPath: string) => {
          const escapedTargetPath = targetPath.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&',
          ); // Escape special regex characters

          const regex = new RegExp(`${escapedTargetPath}.*`);
          const match = filePath.match(regex);

          if (!match) {
            throw Error(
              "Please place the values in the right place don't change any params",
            );
          }

          return match[0];
        };

        const pathRelativeToProjectRoot = extractPath(path, contentFolderName);

        const document = asciidocProcessorController.loadFileWithAttributes(
          path,
          asciidocConfig?.attributes,
        );

        const sluggedFilename = generateSlug(filename);

        await setStoreUsingExtractedInfo(
          sluggedFilename,
          pathRelativeToProjectRoot,
          document,
        );

        fileNameToSlugMap.set(
          filename,
          new FilePathAndSlug(pathRelativeToProjectRoot, sluggedFilename),
        );

        logger.info(
          `Finished adding the file now you can go to /${sluggedFilename} depending on your route to access it.`,
        );
      });

      watcher?.on('change', async (path) => {
        const pathEndsWithOneOfTheSupportedAsciidocExtensions =
          SUPPORTED_ASCIIDOC_FILE_EXTENSIONS.some((ext) => path.endsWith(ext));

        if (!pathEndsWithOneOfTheSupportedAsciidocExtensions) return;

        const filename = path.match(fileNameRE)?.[1] ?? '';

        logger.info(
          `You changed this file ${filename} the store is being updated`,
        );

        const filePathAndSlug = fileNameToSlugMap.get(filename);

        if (!filePathAndSlug) {
          throw Error(`A slug is supposed to exist using this file name ${filename}.
                        Some thing is wrong with the loader please file a report
                        `);
        }

        store.delete(filePathAndSlug.slug);

        const document = asciidocProcessorController.loadFileWithAttributes(
          path,
          asciidocConfig?.attributes,
        );

        await setStoreUsingExtractedInfo(
          filePathAndSlug.pathRelativeToRoot,
          filePathAndSlug.slug,
          document,
        );

        logger.info(`The store is updated`);
      });

      watcher?.on('unlink', (path) => {
        const pathEndsWithOneOfTheSupportedAsciidocExtensions =
          SUPPORTED_ASCIIDOC_FILE_EXTENSIONS.some((ext) => path.endsWith(ext));

        if (!pathEndsWithOneOfTheSupportedAsciidocExtensions) return;

        const fullFilePathMatch = path.match(fileNameRE);

        if (!fullFilePathMatch) {
          throw Error(`This path isn't correct.
                         A folder can use any set of characters but must end in a forward slash.
                         A filename must use word characters digits and whitespace no other characters.
                        `);
        }

        const filename = fullFilePathMatch.groups?.['filename'] ?? '';

        if (!filename) {
          throw Error(
            'There should be a word called filename in the word group',
          );
        }

        logger.info(`You deleted this file ${filename}`);

        const fileNameAndSlug = fileNameToSlugMap.get(filename);

        if (!fileNameAndSlug) {
          throw Error(`A slug is supposed to exist using this file name ${filename}.
                        Some thing is wrong with the loader please file a report.
                        From unlink event using this path ${path}.
                        `);
        }

        store.delete(fileNameAndSlug.slug);

        logger.info('The store has now been updated!');

        logger.info('Finished');
      });

      async function setStoreUsingExtractedInfo(
        projectRelativePath: string,
        slug: string,
        document: Document,
      ) {
        const allowedAsciidocValuesSchema = z.union([
          z.string(),
          z.number(),
          z.boolean(),
        ]);

        const dashedOrSnakeCaseKeysRecordSchema = z.record(
          z
            .string()
            .regex(
              /^(?<first_word>(?:[a-z0-9]+))(?<other_words_in_snake_or_dash_case>(?:-[a-z0-9]+|_[a-z0-9]+)*)$/,
              'You must write using dash case Ex: url-repo',
            ),
          allowedAsciidocValuesSchema.or(allowedAsciidocValuesSchema.array()),
        );

        let attributes: z.infer<typeof dashedOrSnakeCaseKeysRecordSchema>;

        try {
          // Extract raw attributes and normalize them before Zod validation
          const rawAttrs = document.getAttributes() as DocumentAttributes;
          const normalizedAttrs = normalizeAsciiDocAttributes(rawAttrs);

          attributes = dashedOrSnakeCaseKeysRecordSchema.parse(normalizedAttrs);
        } catch (error: unknown) {
          if (error instanceof z.ZodError) {
            logger.error(
              'All attributes must be written in dashed or snake case in files',
            );
            for (const issue of error.issues) {
              logger.error(
                `In this file ${projectRelativePath} this attribute ${issue.path} has this problem ${issue.message}`,
              );
            }
          }

          return;
        }

        const data = await parseData({
          id: slug,
          data: attributes,
          filePath: projectRelativePath,
        });

        store.set({
          id: slug,
          data,
          filePath: projectRelativePath,
          digest: generateDigest(attributes),
          rendered: {
            metadata: {
              frontmatter: data,
              imagePaths: document
                .getImages()
                .map((image) => image.getTarget()),
              headings: document.getSections().map((section) => ({
                text: section.getTitle() ?? '',
                depth: section.getLevel(),
                slug: generateSlug(section.getTitle() ?? ''),
              })),
            },
            html: document.convert(),
          },
        });
      }
    },
  } satisfies Loader;
}
