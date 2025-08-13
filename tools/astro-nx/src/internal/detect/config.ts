import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export interface AstroConfig {
  site?: string;
  base?: string;
  outDir?: string;
  integrations?: string[];
  contentDir?: string;
}

/**
 * Finds the Astro configuration file in the project root
 * @param projectRoot - The root path of the project
 * @returns The path to the config file or null if not found
 */
export function findAstroConfig(projectRoot: string): string | null {
  const configPatterns = [
    'astro.config.ts',
    'astro.config.mjs', 
    'astro.config.cjs',
    'astro.config.js'
  ];
  
  for (const pattern of configPatterns) {
    const configPath = join(projectRoot, pattern);
    if (existsSync(configPath)) {
      return configPath;
    }
  }
  
  return null;
}

/**
 * Checks if the project has content collections configured
 * @param projectRoot - The root path of the project
 * @returns True if content collections config exists
 */
export function hasContentCollections(projectRoot: string): boolean {
  const configPaths = [
    join(projectRoot, 'src/content/config.ts'),
    join(projectRoot, 'src/content/config.js')
  ];
  
  return configPaths.some(path => existsSync(path));
}

/**
 * Gets list of existing content collections from the project
 * @param projectRoot - The root path of the project
 * @returns Array of collection directory names
 */
export function getContentCollections(projectRoot: string): string[] {
  const contentDir = join(projectRoot, 'src/content');
  
  if (!existsSync(contentDir)) {
    return [];
  }
  
  try {
    const entries = readdirSync(contentDir, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .filter(name => !name.startsWith('.'));
  } catch {
    return [];
  }
}

/**
 * Reads and parses integrations from the Astro config file using text scanning
 * Does not execute user code - uses best-effort text parsing
 * @param projectRoot - The root path of the project
 * @returns Array of integration names found in the config
 */
export function readIntegrations(projectRoot: string): string[] {
  const config = readAstroConfig(projectRoot);
  return config.integrations || [];
}

/**
 * Reads and parses the Astro config file using best-effort text scanning
 * Does not execute user code - uses text parsing to extract common config options
 * @param projectRoot - The root path of the project
 * @returns Partial Astro configuration object
 */
export function readAstroConfig(projectRoot: string): AstroConfig {
  const configPath = findAstroConfig(projectRoot);
  
  if (!configPath) {
    return {};
  }
  
  try {
    const configContent = readFileSync(configPath, 'utf-8');
    const config: AstroConfig = {};
    
    // Extract site configuration
    const siteMatch = configContent.match(/site\s*:\s*['"]([^'"]+)['"]/);
    if (siteMatch) {
      config.site = siteMatch[1];
    }
    
    // Extract base configuration
    const baseMatch = configContent.match(/base\s*:\s*['"]([^'"]+)['"]/);
    if (baseMatch) {
      config.base = baseMatch[1];
    }
    
    // Extract outDir configuration (less common, but possible)
    const outDirMatch = configContent.match(/outDir\s*:\s*['"]([^'"]+)['"]/);
    if (outDirMatch) {
      config.outDir = outDirMatch[1];
    }
    
    // Extract integrations
    const integrations: string[] = [];
    
    // Look for integrations array in various formats
    // Pattern 1: integrations: [integration1(), integration2()]
    const integrationsArrayRegex = /integrations\s*:\s*\[(.*?)\]/s;
    const integrationsArrayMatch = configContent.match(integrationsArrayRegex);
    if (integrationsArrayMatch) {
      const integrationsContent = integrationsArrayMatch[1];
      
      // Extract integration function calls
      const integrationRegex = /(\w+)\s*\(/g;
      let match;
      while ((match = integrationRegex.exec(integrationsContent)) !== null) {
        const integrationName = match[1];
        if (!integrations.includes(integrationName)) {
          integrations.push(integrationName);
        }
      }
    }
    
    // Pattern 2: Look for @astrojs/ imports and infer integrations
    const importRegex = /import\s+(?:\{[^}]*\}|\w+)\s+from\s+['"]@astrojs\/(\w+)['"];?/g;
    let importMatch;
    while ((importMatch = importRegex.exec(configContent)) !== null) {
      const integrationName = importMatch[1];
      if (!integrations.includes(integrationName)) {
        integrations.push(integrationName);
      }
    }
    
    // Pattern 3: Look for require calls
    const requireRegex = /require\s*\(\s*['"]@astrojs\/(\w+)['"]\s*\)/g;
    let requireMatch;
    while ((requireMatch = requireRegex.exec(configContent)) !== null) {
      const integrationName = requireMatch[1];
      if (!integrations.includes(integrationName)) {
        integrations.push(integrationName);
      }
    }
    
    // Pattern 4: Look for specific content-related integrations (markdoc, mdx)
    const contentIntegrations = ['markdoc', 'mdx', 'asciidoc'];
    contentIntegrations.forEach(integration => {
      const importPattern = new RegExp(`import +\\w+ +from +['"](.*${integration}.*)['"],[
]`, 'i');
      const requirePattern = new RegExp(`require *\\( *['"](.*${integration}.*)['"] *\\)`, 'i');
      
      if (importPattern.test(configContent) || requirePattern.test(configContent)) {
        if (!integrations.includes(integration)) {
          integrations.push(integration);
        }
      }
    });
    
    config.integrations = integrations;
    
    // Detect contentDir - look for content collections directory
    const contentDir = join(projectRoot, 'src/content');
    if (existsSync(contentDir)) {
      config.contentDir = 'src/content';
    }
    
    return config;
    
  } catch {
    // If we can't read or parse the config, return empty config
    return {};
  }
}
