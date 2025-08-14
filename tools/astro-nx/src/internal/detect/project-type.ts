import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export type ProjectType = 'asciidoc' | 'mdx' | 'markdoc' | 'markdown';
export type ContentExtension = '.adoc' | '.mdx' | '.mdoc' | '.md';

// In-memory cache for detection results during a single generator run
interface DetectionCache {
  projectTypes: Map<string, ProjectType>;
  contentExtensions: Map<string, ContentExtension>;
}

const detectionCache: DetectionCache = {
  projectTypes: new Map(),
  contentExtensions: new Map(),
};

/**
 * Clears the detection cache (useful for testing)
 */
export function clearDetectionCache(): void {
  detectionCache.projectTypes.clear();
  detectionCache.contentExtensions.clear();
}

/**
 * Detects the project type based on package.json dependencies
 * Results are cached per project during a single generator run
 * @param projectRoot - The root path of the project
 * @returns The detected project type
 */
export function getProjectType(projectRoot: string): ProjectType {
  // Check cache first
  if (detectionCache.projectTypes.has(projectRoot)) {
    return detectionCache.projectTypes.get(projectRoot)!;
  }

  let projectType: ProjectType = 'markdown'; // Default fallback

  try {
    const packageJsonPath = join(projectRoot, 'package.json');
    
    // Check if package.json exists - handle mocked filesystem gracefully
    if (!existsSync(packageJsonPath)) {
      detectionCache.projectTypes.set(projectRoot, projectType);
      return projectType;
    }
    
    const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
    
    // Handle case where readFileSync returns non-string (for mocking compatibility)
    if (typeof packageJsonContent !== 'string') {
      detectionCache.projectTypes.set(projectRoot, projectType);
      return projectType;
    }
    
    const packageJson = JSON.parse(packageJsonContent);
    
    // Ensure dependencies objects exist and are objects
    const dependencies = (packageJson?.dependencies && typeof packageJson.dependencies === 'object') 
      ? packageJson.dependencies 
      : {};
    const devDependencies = (packageJson?.devDependencies && typeof packageJson.devDependencies === 'object') 
      ? packageJson.devDependencies 
      : {};
    
    const allDeps = { ...dependencies, ...devDependencies };
    
    // Check for MDX integration (highest priority)
    if (allDeps['@astrojs/mdx']) {
      projectType = 'mdx';
    }
    // Check for Markdoc integration (second priority)
    else if (allDeps['@astrojs/markdoc']) {
      projectType = 'markdoc';
    }
    // Check for AsciiDoc integrations (third priority)
    else if (allDeps['astro-asciidoc'] || allDeps['@astrolib/asciidoc'] || allDeps['asciidoctor']) {
      projectType = 'asciidoc';
    }
    // Default to markdown
    else {
      projectType = 'markdown';
    }
    
  } catch (error) {
    // If any error occurs during detection, gracefully fall back to markdown
    // This handles JSON parsing errors, file system errors, etc.
    projectType = 'markdown';
  }

  // Cache the result
  detectionCache.projectTypes.set(projectRoot, projectType);
  return projectType;
}

/**
 * Gets the default content file extension based on project type
 * Results are cached per project during a single generator run
 * @param projectRoot - The root path of the project
 * @returns The default content extension
 */
export function getDefaultContentExt(projectRoot: string): ContentExtension {
  // Check cache first
  if (detectionCache.contentExtensions.has(projectRoot)) {
    return detectionCache.contentExtensions.get(projectRoot)!;
  }

  const projectType = getProjectType(projectRoot);
  let extension: ContentExtension;
  
  switch (projectType) {
    case 'asciidoc':
      extension = '.adoc';
      break;
    case 'mdx':
      extension = '.mdx';
      break;
    case 'markdoc':
      extension = '.mdoc'; // Fixed: Use .mdoc instead of .markdoc
      break;
    case 'markdown':
    default:
      extension = '.md';
      break;
  }

  // Cache the result
  detectionCache.contentExtensions.set(projectRoot, extension);
  return extension;
}
