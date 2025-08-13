import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export type ProjectType = 'asciidoc' | 'mdx' | 'markdoc' | 'markdown';
export type ContentExtension = '.adoc' | '.mdx' | '.mdoc' | '.md';

/**
 * Detects the project type based on package.json dependencies
 * @param projectRoot - The root path of the project
 * @returns The detected project type
 */
export function getProjectType(projectRoot: string): ProjectType {
  const packageJsonPath = join(projectRoot, 'package.json');
  
  if (!existsSync(packageJsonPath)) {
    return 'markdown';
  }
  
  try {
    const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);
    
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    
    // Check for MDX integration
    if (allDeps['@astrojs/mdx']) {
      return 'mdx';
    }
    
    // Check for Markdoc integration
    if (allDeps['@astrojs/markdoc']) {
      return 'markdoc';
    }
    
    // Check for AsciiDoc integrations
    if (allDeps['astro-asciidoc'] || allDeps['@astrolib/asciidoc'] || allDeps['asciidoctor']) {
      return 'asciidoc';
    }
    
    // Default to markdown
    return 'markdown';
    
  } catch {
    // If we can't parse package.json, default to markdown
    return 'markdown';
  }
}

/**
 * Gets the default content file extension based on project type
 * @param projectRoot - The root path of the project
 * @returns The default content extension
 */
export function getDefaultContentExt(projectRoot: string): ContentExtension {
  const projectType = getProjectType(projectRoot);
  
  switch (projectType) {
    case 'asciidoc':
      return '.adoc';
    case 'mdx':
      return '.mdx';
    case 'markdoc':
      return '.mdoc';
    case 'markdown':
    default:
      return '.md';
  }
}
