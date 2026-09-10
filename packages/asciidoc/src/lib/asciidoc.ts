import { type Loader } from 'astro/loaders';
import {
  AsciidocProcessorController,
  generateSlug,
  getAsciidocPaths,
  loadAsciidocConfig,
} from './internal';
import type { asciidocConfigObjectSchema } from './internal';
import { z } from 'astro/zod';
import type { Document } from 'asciidoctor';
import {
  basename,
  extname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from 'node:path';
import { fileURLToPath } from 'node:url';

export type AsciidocConfigObject = z.infer<typeof asciidocConfigObjectSchema>;

const CSV_LIST_REGEX =
  /^(?:[a-zA-Z0-9_-]+,\s*|[a-zA-Z0-9_-]+(?:,\s+[a-zA-Z0-9_-]+)+,?)$/;
const SUPPORTED_ASCIIDOC_FILE_EXTENSIONS = new Set(['.adoc', '.asciidoc']);

export type DocumentAttributes = Record<string, unknown>;

/**
 * Normalizes AsciiDoc attributes prior to schema validation.
 *
 * AsciiDoc uses empty attributes as boolean flags and commonly represents
 * lists as comma-separated values. Astro content schemas use JavaScript-style
 * camelCase names, so dashed and snake_case attributes are normalized here.
 */
export function normalizeAsciiDocAttributes(
  input: DocumentAttributes,
): DocumentAttributes {
  const normalizedAttributes: DocumentAttributes = {};

  for (const [key, value] of Object.entries(input)) {
    const camelCaseKey = key.replace(/[-_]([a-z])/g, (_, letter: string) =>
      letter.toUpperCase(),
    );

    if (value === '') {
      normalizedAttributes[camelCaseKey] = true;
      continue;
    }

    if (typeof value === 'string' && CSV_LIST_REGEX.test(value)) {
      normalizedAttributes[camelCaseKey] = value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      continue;
    }

    normalizedAttributes[camelCaseKey] = value;
  }

  return normalizedAttributes;
}

type FilePathAndSlug = {
  pathRelativeToRoot: string;
  slug: string;
};

/**
 * Loads AsciiDoc content from a content root relative to the Astro project.
 *
 * The content root contract is deliberately the same as Astro's content
 * loader contract: pass the directory containing collections (for example
 * `src/content`), not a collection directory. The loader appends the
 * collection name supplied by Astro.
 */
export function asciidocLoader(contentFolderName: string) {
  const asciidocProcessorController = new AsciidocProcessorController();
  let asciidocConfig: AsciidocConfigObject | undefined;

  return {
    name: 'forastro/asciidoc-loader',
    async load(context) {
      const contentFolderNameSchema = z.string().regex(
        /^\w+(?:\/\w+)*$/,
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

      // URL.pathname is not a filesystem path on Windows (`/C:/...`). Convert
      // the Astro root URL before passing it to path and glob APIs.
      const resolvedRootRepo = fileURLToPath(astroConfig.root);
      const collectionRoot = resolve(
        resolvedRootRepo,
        contentFolderName,
        collection,
      );

      asciidocConfig = await loadAsciidocConfig(resolvedRootRepo);

      const asciidocFilePaths = await getAsciidocPaths(collectionRoot);

      switch (asciidocConfig.attributes?.sourceHighlighter) {
        case 'shiki':
          if (asciidocConfig.attributes.shikiTheme) {
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

      if (asciidocConfig.blocks || asciidocConfig.macros) {
        logger.info('Creating Asciidoc registry from config file');
        asciidocProcessorController.registerBlocksAndMacrosFromConfig(
          asciidocConfig.blocks,
          asciidocConfig.macros,
        );
      }

      logger.info('Clearing the store');
      store.clear();

      logger.info('Extracting data from files then storing it');
      const filePathToSlugMap = new Map<string, FilePathAndSlug>();

      for (const path of asciidocFilePaths) {
        const absoluteFilePath = resolve(collectionRoot, path);
        const filePathAndSlug = getFilePathAndSlug(
          resolvedRootRepo,
          collectionRoot,
          absoluteFilePath,
        );
        const document = asciidocProcessorController.loadFileWithAttributes(
          absoluteFilePath,
          asciidocConfig.attributes,
        );

        await setStoreUsingExtractedInfo(
          filePathAndSlug.pathRelativeToRoot,
          filePathAndSlug.slug,
          document,
        );
        filePathToSlugMap.set(
          filePathAndSlug.pathRelativeToRoot,
          filePathAndSlug,
        );
      }

      watcher?.on('add', async (path) => {
        if (!isSupportedFile(path)) return;

        const absoluteFilePath = resolveWatcherPath(path, resolvedRootRepo);
        if (!isInsideDirectory(absoluteFilePath, collectionRoot)) return;

        logger.info(
          `You added this file ${path}; its info will now be parsed and added to the store`,
        );

        const filePathAndSlug = getFilePathAndSlug(
          resolvedRootRepo,
          collectionRoot,
          absoluteFilePath,
        );
        const document = asciidocProcessorController.loadFileWithAttributes(
          absoluteFilePath,
          asciidocConfig?.attributes,
        );

        await setStoreUsingExtractedInfo(
          filePathAndSlug.pathRelativeToRoot,
          filePathAndSlug.slug,
          document,
        );
        filePathToSlugMap.set(
          filePathAndSlug.pathRelativeToRoot,
          filePathAndSlug,
        );
      });

      watcher?.on('change', async (path) => {
        if (!isSupportedFile(path)) return;

        const absoluteFilePath = resolveWatcherPath(path, resolvedRootRepo);
        if (!isInsideDirectory(absoluteFilePath, collectionRoot)) return;

        const pathRelativeToRoot = toPosixPath(
          relative(resolvedRootRepo, absoluteFilePath),
        );
        const filePathAndSlug = filePathToSlugMap.get(pathRelativeToRoot);

        if (!filePathAndSlug) {
          throw new Error(
            `No loader entry exists for changed file ${pathRelativeToRoot}.`,
          );
        }

        logger.info(
          `You changed this file ${pathRelativeToRoot}; the store is being updated`,
        );
        store.delete(filePathAndSlug.slug);

        const document = asciidocProcessorController.loadFileWithAttributes(
          absoluteFilePath,
          asciidocConfig?.attributes,
        );
        await setStoreUsingExtractedInfo(
          filePathAndSlug.pathRelativeToRoot,
          filePathAndSlug.slug,
          document,
        );

        logger.info('The store is updated');
      });

      watcher?.on('unlink', (path) => {
        if (!isSupportedFile(path)) return;

        const absoluteFilePath = resolveWatcherPath(path, resolvedRootRepo);
        if (!isInsideDirectory(absoluteFilePath, collectionRoot)) return;

        const pathRelativeToRoot = toPosixPath(
          relative(resolvedRootRepo, absoluteFilePath),
        );
        const filePathAndSlug = filePathToSlugMap.get(pathRelativeToRoot);

        if (!filePathAndSlug) {
          throw new Error(
            `No loader entry exists for deleted file ${pathRelativeToRoot}.`,
          );
        }

        logger.info(`You deleted this file ${pathRelativeToRoot}`);
        store.delete(filePathAndSlug.slug);
        filePathToSlugMap.delete(pathRelativeToRoot);
        logger.info('The store has now been updated');
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
        const attributeKeySchema = z
          .string()
          .regex(
            /^[a-z][A-Za-z0-9]*$/,
            'You must write using a valid attribute name',
          );
        const attributesSchema = z.record(
          attributeKeySchema,
          allowedAsciidocValuesSchema.or(allowedAsciidocValuesSchema.array()),
        );

        let attributes: z.infer<typeof attributesSchema>;

        try {
          attributes = attributesSchema.parse(
            normalizeAsciiDocAttributes(
              document.getAttributes() as DocumentAttributes,
            ),
          );
        } catch (error: unknown) {
          if (error instanceof z.ZodError) {
            logger.error(
              'All attributes must be written using valid attribute names',
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

function getFilePathAndSlug(
  projectRoot: string,
  collectionRoot: string,
  absoluteFilePath: string,
): FilePathAndSlug {
  const extension = extname(absoluteFilePath).toLowerCase();
  const filename = basename(absoluteFilePath, extension);

  if (
    !SUPPORTED_ASCIIDOC_FILE_EXTENSIONS.has(extension) ||
    !/^[\w\s\d-]+$/.test(filename)
  ) {
    throw new Error(
      `Invalid AsciiDoc filename in ${absoluteFilePath}. Filenames may contain words, digits, spaces, and hyphens.`,
    );
  }

  const pathRelativeToRoot = toPosixPath(
    relative(projectRoot, absoluteFilePath),
  );
  const pathRelativeToCollection = toPosixPath(
    relative(collectionRoot, absoluteFilePath),
  );
  const slugSource = pathRelativeToCollection.slice(
    0,
    pathRelativeToCollection.length - extension.length,
  );
  const slug = generateSlug(slugSource.replaceAll('/', '-'));

  return { pathRelativeToRoot, slug };
}

function isSupportedFile(filePath: string): boolean {
  return SUPPORTED_ASCIIDOC_FILE_EXTENSIONS.has(
    extname(filePath).toLowerCase(),
  );
}

function resolveWatcherPath(filePath: string, projectRoot: string): string {
  return isAbsolute(filePath)
    ? resolve(filePath)
    : resolve(projectRoot, filePath);
}

function isInsideDirectory(filePath: string, directory: string): boolean {
  const normalizedFilePath = resolve(filePath);
  const normalizedDirectory = resolve(directory);
  return (
    normalizedFilePath === normalizedDirectory ||
    normalizedFilePath.startsWith(`${normalizedDirectory}${sep}`)
  );
}

function toPosixPath(filePath: string): string {
  return filePath.replaceAll('\\', '/');
}
