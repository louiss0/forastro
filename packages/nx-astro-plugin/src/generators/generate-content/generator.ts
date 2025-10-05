import type { Tree } from '@nx/devkit';
import { readProjectConfiguration, joinPathFragments, generateFiles, formatFiles } from '@nx/devkit';
import { detectIntegrations } from '../../utils/astro.js';
import { join } from 'node:path';

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
      generateFiles(tree, join(__dirname, 'templates', 'blog'), base, { tmpl: '' });
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