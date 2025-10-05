import type { Tree } from '@nx/devkit';
import { readProjectConfiguration, joinPathFragments, generateFiles, formatFiles } from '@nx/devkit';
import { detectIntegrations } from '../../utils/astro.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

interface Schema {
  project: string;
  presets?: ('blog' | 'docs' | 'landing')[];
  mdxExamples?: boolean;
  tailwindExamples?: boolean;
}

export default async function generateContent(tree: Tree, options: Schema) {
  const proj = readProjectConfiguration(tree, options.project);
  const integrations = detectIntegrations(proj.root);

  // Always create a minimal blog preset if requested
  if (options.presets?.includes('blog')) {
    const base = joinPathFragments(proj.root, 'src');
    if (!tree.exists(join(base, 'content'))) {
      const fileName = fileURLToPath(import.meta.url);
      const dirName = dirname(fileName);
      generateFiles(tree, join(dirName, 'templates', 'blog'), base, { tmpl: '' });
    }
  }

  // Add MDX example if mdx present and requested
  if (options.mdxExamples && integrations.includes('mdx')) {
    const base = joinPathFragments(proj.root, 'src', 'pages');
    if (!tree.exists(join(base, 'example.mdx'))) {
      tree.write(join(base, 'example.mdx'), '# Hello MDX!');
    }
  }

  await formatFiles(tree);
}