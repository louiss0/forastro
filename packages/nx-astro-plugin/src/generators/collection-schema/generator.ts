import type { Tree } from '@nx/devkit';
import {
  formatFiles,
  joinPathFragments,
  readProjectConfiguration,
} from '@nx/devkit';
import { parseAstroConfigDirs } from '../../utils/astro';
import { toCamel, toKebab } from '../../utils/naming';

interface Schema {
  project: string;
  name: string;
}

function collectionDefinition(variableName: string): string {
  return `\nconst ${variableName} = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    published: z.boolean().default(true),
    date: z.coerce.date().optional(),
  }),
});\n`;
}

function addContentImport(content: string): string {
  const importPattern = /import\s*\{([^}]*)\}\s*from\s*['"]astro:content['"];?/;
  const match = content.match(importPattern);

  if (!match) {
    return `import { defineCollection, z } from 'astro:content';\n${content}`;
  }

  const imports = new Set(
    match[1]
      ?.split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  );
  imports.add('defineCollection');
  imports.add('z');
  return content.replace(
    importPattern,
    `import { ${Array.from(imports).join(', ')} } from 'astro:content';`,
  );
}

function addCollectionToConfig(
  content: string,
  collection: string,
  variableName: string,
): string {
  const definition = collectionDefinition(variableName);
  const collectionsExportPattern =
    /export\s+const\s+collections\s*=\s*\{([\s\S]*?)\}\s*;?/;
  const collectionsExport = content.match(collectionsExportPattern);

  if (collectionsExport) {
    const existingEntries = collectionsExport[1]?.trim() ?? '';
    const escapedCollection = collection.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const collectionKeyPattern = new RegExp(
      `(?:^|[,\\n])\\s*(?:['"]${escapedCollection}['"]|\\b${variableName}\\b)(?:\\s*:)?`,
    );
    if (collectionKeyPattern.test(existingEntries)) return content;

    const entries = existingEntries
      ? `${existingEntries.replace(/,?\s*$/, '')},\n  `
      : '  ';
    const updatedExport = `export const collections = {\n  ${entries}'${collection}': ${variableName}\n};`;
    const exportStart = collectionsExport.index ?? content.length;
    const contentBeforeExport = content.slice(0, exportStart);
    const contentFromExport = content
      .slice(exportStart)
      .replace(collectionsExportPattern, updatedExport);
    return `${contentBeforeExport}${definition}\n${contentFromExport}`;
  }

  return `${content}${definition}\nexport const collections = { '${collection}': ${variableName} };\n`;
}

/** Adds a collection definition to Astro 7's central content configuration. */
export default async function generator(tree: Tree, options: Schema) {
  const project = readProjectConfiguration(tree, options.project);
  const { srcDir } = parseAstroConfigDirs(project.root);
  const collection = toKebab(options.name);
  const variableName = toCamel(options.name);
  const filePath = joinPathFragments(project.root, srcDir, 'content.config.ts');
  const existingContent = tree.exists(filePath)
    ? (tree.read(filePath, 'utf-8') ?? '')
    : '';
  const contentWithImport = addContentImport(existingContent);
  const nextContent = addCollectionToConfig(
    contentWithImport,
    collection,
    variableName,
  );

  tree.write(filePath, nextContent);
  await formatFiles(tree);
}
