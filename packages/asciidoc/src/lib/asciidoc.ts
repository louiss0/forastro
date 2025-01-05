import asciidoctor, { type Document } from 'asciidoctor';
import { type Loader } from 'astro/loaders';
import {
  asciidocConfigObjectSchema,
  registerBlocksAndMacrosFromConfig,
  generateSlug,
  getAsciidocPaths,
  loadAsciidocConfig,
  registerPrism_JS,
  registerShiki,
  transformObjectKeysIntoDashedCase,
} from './internal';
import { z } from 'astro/zod';

import { resolve } from 'node:path';

export type AsciidocConfigObject = z.infer<typeof asciidocConfigObjectSchema>;

const processor = asciidoctor();

class FilePathAndSlug {
  constructor (
    public readonly pathRelativeToRoot: string,
    public readonly slug: string,
  ) { }
}

const contentFolderNameSchema = z.string().regex(
  /\w+(?:\/\w+)*/,
  `A content folder name must be a string with word characters at the front only.
   Ex: content
   When referring to deeply nested folders in the project make sure you place a forward slash  
   before each folder name after the parent folder name.
   Ex: src/content

   No spaces or special characters.  
   `
)

export function createAsciidocLoader(contentFolderName: string) {
  return {
    name: 'forastro/asciidoc-loader',
    async load({
      store,
      config: astroConfig,
      generateDigest,
      logger,
      collection,
      parseData,
      watcher,
    }) {


      contentFolderNameSchema.parse(contentFolderName)

      logger.info('Loading Asciidoc paths and config file');
      const resolvedRootRepo = `${resolve(astroConfig.root.pathname)}`;

      const [config, paths] = await Promise.all([
        loadAsciidocConfig(resolvedRootRepo),
        getAsciidocPaths(`${resolvedRootRepo}/${contentFolderName}/${collection}`),
      ]);

      if (paths.length === 0) {
        throw Error(
          `There are no files in this folder ${contentFolderName}.
            Please use a different folder.
            `
        );
      }


      switch (config.attributes?.sourceHighlighter) {


        case 'shiki':
          await registerShiki(processor, config.attributes.shikiTheme!);
          break

        case 'prism':
          registerPrism_JS(processor, config.attributes.prismLanguages!)
          break

      }



      if (Object.keys(config).length !== 0) {
        logger.info(`Creating Asciidoc Registry from using config file`);

        registerBlocksAndMacrosFromConfig(
          processor,
          config.blocks,
          config.macros,
        );
      }

      logger.info('Clearing the store');

      store.clear();

      logger.info('Extracting data from files then storing it');

      const fileNameToSlugMap = new Map<string, FilePathAndSlug>();

      const fileNameRE =
        /(?<filename>[\w\s\d-]+)(?<extension>\.[a-z]+)$/;



      for (const path of paths) {
        const fullFilePathMatch = path.match(fileNameRE);

        if (!fullFilePathMatch) {
          throw Error(`This path isn't correct.
                         A folder can use any set of characters but must end in a forward slash.
                         A filename must use word characters digits and whitespace no other characters.
                        `);
        }

        const { filename } = fullFilePathMatch.groups!;

        if (!filename) {
          throw Error(
            'There should be a word called filename in the word group',
          );
        }

        const pathPrefixedWithFolderName = `${contentFolderName}/${collection}/${path}`;

        const document = loadFileWithRegistryAndAttributes(
          `${resolvedRootRepo}/${pathPrefixedWithFolderName}`,
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

        const { filename } = fullFilePathMatch.groups!;

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

        const document = loadFileWithRegistryAndAttributes(path);


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

        const filename = path.match(fileNameRE)![2]!;

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

        const document = loadFileWithRegistryAndAttributes(path);

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

        const { filename } = fullFilePathMatch.groups!;

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

      function loadFileWithRegistryAndAttributes(path: string) {

        return processor.loadFile(path, {
          attributes:
            config.attributes &&
            transformObjectKeysIntoDashedCase(config.attributes),
          safe: 10,
          catalog_assets: true,
        });
      }

      async function setStoreUsingExtractedInfo(
        projectRelativePath: string,
        slug: string,
        document: Document,
      ) {

        const data = await parseData({
          id: slug,
          data: document.getAttributes(),
          filePath: projectRelativePath,
        });


        store.set({
          id: slug,
          data,
          filePath: projectRelativePath,
          digest: generateDigest(data),
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

export function asciidocLoader(folder_name: string) {
  return createAsciidocLoader(folder_name);
}
