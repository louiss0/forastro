import { type Loader } from 'astro/loaders';
import {
  asciidocConfigObjectSchema,
  AsciidocProcessorController,
  generateSlug,
  getAsciidocPaths,
  loadAsciidocConfig,
} from './internal';
import { z } from 'astro/zod';

import { resolve } from 'node:path';
import type { Document } from 'asciidoctor';

export type AsciidocConfigObject = z.infer<typeof asciidocConfigObjectSchema>;

class FilePathAndSlug {
  constructor (
    public readonly pathRelativeToRoot: string,
    public readonly slug: string,
  ) { }
}


let asciidocConfig: AsciidocConfigObject | undefined

export function asciidocLoader(contentFolderName: string) {

  const asciidocProcessorController = new AsciidocProcessorController()

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
   `
      )

      contentFolderNameSchema.parse(contentFolderName)

      const {
        store,
        config: astroConfig,
        generateDigest,
        logger,
        collection,
        parseData,
        watcher,
      } = context


      logger.info('Loading Asciidoc paths and config file');

      const resolvedRootRepo = `${resolve(astroConfig.root.pathname)}`;

      asciidocConfig = asciidocConfig ?? await loadAsciidocConfig(resolvedRootRepo)

      const asciidocFilePaths = await getAsciidocPaths(
        `${resolvedRootRepo}/${contentFolderName}/${collection}`
      )


      if (asciidocFilePaths.length === 0) {
        throw Error(
          `There are no files in this folder ${contentFolderName}.
            Please use a different folder.
            `
        );
      }


      switch (asciidocConfig.attributes?.sourceHighlighter) {


        case 'shiki':
          await asciidocProcessorController.registerShiki(
            asciidocConfig.attributes.shikiTheme!
          );
          break

        case 'prism':
          asciidocProcessorController.registerPrism_JS(
            asciidocConfig.attributes.prismLanguages!
          )
          break

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

        const { filename } = fullFilePathMatch.groups!;

        if (!filename) {
          throw Error(
            'There should be a word called filename in the word group',
          );
        }

        const pathPrefixedWithFolderName = `${contentFolderName}/${collection}/${path}`;

        const document = asciidocProcessorController.loadFileWithAttributes(
          `${resolvedRootRepo}/${pathPrefixedWithFolderName}`,
          asciidocConfig.attributes
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

        const document = asciidocProcessorController
          .loadFileWithAttributes(path, asciidocConfig?.attributes);


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

        const document = asciidocProcessorController
          .loadFileWithAttributes(path, asciidocConfig?.attributes);

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


      async function setStoreUsingExtractedInfo(
        projectRelativePath: string,
        slug: string,
        document: Document,
      ) {


        const dashedCaseRecordSchema = z.record(
          z.string().regex(
            /^(?:[a-z0-9]+)(?:-[a-z0-9]+)*$/,
            "You must write using dash case Ex: url-repo"
          ),
          z.union([z.string(), z.number(), z.boolean()])
        )

        let attributes: z.infer<typeof dashedCaseRecordSchema>

        try {

          attributes = dashedCaseRecordSchema.transform((attrs) =>
            Object.fromEntries(Object.entries(attrs).map(
              ([key, value]) => [
                key.replace(
                  /-([a-z])/g,
                  (_, letter) => letter.toUpperCase()),
                value
              ]
            ))
          ).parse(document.getAttributes())

        } catch (error: unknown) {



          if (error instanceof z.ZodError) {
            logger.error("All attributes must be written in dashed case in files")
            for (const issue of error.issues) {
              logger.error(`In this file ${projectRelativePath} this attribute ${issue.path} has this problem ${issue.message}`)
            }

          }

          return

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

