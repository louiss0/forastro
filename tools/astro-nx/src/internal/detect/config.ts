import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export interface AstroConfig {
  site?: string;
  base?: string;
  outDir?: string;
  integrations: string[]; // Always an array, never undefined
  contentDir: string; // Always defined with stable default
}

// In-memory cache for config detection results during a single generator run
interface ConfigCache {
  astroConfigs: Map<string, AstroConfig>;
  configPaths: Map<string, string | null>;
  contentCollections: Map<string, string[]>;
  hasContentCollections: Map<string, boolean>;
}

const configCache: ConfigCache = {
  astroConfigs: new Map(),
  configPaths: new Map(),
  contentCollections: new Map(),
  hasContentCollections: new Map(),
};

/**
 * Clears the config detection cache (useful for testing)
 */
export function clearConfigCache(): void {
  configCache.astroConfigs.clear();
  configCache.configPaths.clear();
  configCache.contentCollections.clear();
  configCache.hasContentCollections.clear();
}

/**
 * Creates a stable default AstroConfig with guaranteed non-null values
 * @param projectRoot - The project root for determining content directory
 * @returns Default AstroConfig with stable values
 */
function createDefaultAstroConfig(projectRoot: string): AstroConfig {
  return {
    integrations: [], // Always an empty array, never undefined
    contentDir: 'src/content', // Stable default - always defined
    site: undefined,
    base: undefined,
    outDir: undefined,
  };
}

/**
 * Finds the Astro configuration file in the project root
 * Results are cached per project during a single generator run
 * @param projectRoot - The root path of the project
 * @returns The path to the config file or null if not found
 */
export function findAstroConfig(projectRoot: string): string | null {
  // Check cache first
  if (configCache.configPaths.has(projectRoot)) {
    return configCache.configPaths.get(projectRoot)!;
  }

  const configPatterns = [
    'astro.config.ts',
    'astro.config.mjs', 
    'astro.config.cjs',
    'astro.config.js'
  ];
  
  let configPath: string | null = null;
  
  try {
    for (const pattern of configPatterns) {
      const fullPath = join(projectRoot, pattern);
      if (existsSync(fullPath)) {
        configPath = fullPath;
        break;
      }
    }
  } catch (error) {
    // Handle file system errors gracefully
    configPath = null;
  }
  
  // Cache the result
  configCache.configPaths.set(projectRoot, configPath);
  return configPath;
}

/**
 * Checks if the project has content collections configured
 * Results are cached per project during a single generator run
 * @param projectRoot - The root path of the project
 * @returns True if content collections config exists
 */
export function hasContentCollections(projectRoot: string): boolean {
  // Check cache first
  if (configCache.hasContentCollections.has(projectRoot)) {
    return configCache.hasContentCollections.get(projectRoot)!;
  }

  let hasCollections = false;
  
  try {
    const configPaths = [
      join(projectRoot, 'src/content/config.ts'),
      join(projectRoot, 'src/content/config.js')
    ];
    
    hasCollections = configPaths.some(path => existsSync(path));
  } catch (error) {
    // Handle file system errors gracefully
    hasCollections = false;
  }
  
  // Cache the result
  configCache.hasContentCollections.set(projectRoot, hasCollections);
  return hasCollections;
}

/**
 * Gets list of existing content collections from the project
 * Results are cached per project during a single generator run
 * @param projectRoot - The root path of the project
 * @returns Array of collection directory names
 */
export function getContentCollections(projectRoot: string): string[] {
  // Check cache first
  if (configCache.contentCollections.has(projectRoot)) {
    return configCache.contentCollections.get(projectRoot)!;
  }

  let collections: string[] = [];
  
  try {
    const contentDir = join(projectRoot, 'src/content');
    
    if (!existsSync(contentDir)) {
      // Cache empty result
      configCache.contentCollections.set(projectRoot, collections);
      return collections;
    }
    
    const entries = readdirSync(contentDir, { withFileTypes: true });
    collections = entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .filter(name => !name.startsWith('.'));
      
  } catch (error) {
    // Handle file system errors gracefully
    collections = [];
  }
  
  // Cache the result
  configCache.contentCollections.set(projectRoot, collections);
  return collections;
}

/**
 * Reads and parses integrations from the Astro config file using text scanning
 * Does not execute user code - uses best-effort text parsing
 * @param projectRoot - The root path of the project
 * @returns Array of integration names found in the config
 */
export function readIntegrations(projectRoot: string): string[] {
  const config = readAstroConfig(projectRoot);
  return config.integrations; // Always an array now
}

/**
 * Reads and parses the Astro config file using best-effort text scanning
 * Does not execute user code - uses text parsing to extract common config options
 * @param projectRoot - The root path of the project
 * @returns AstroConfig with guaranteed stable defaults
 */
export function readAstroConfig(projectRoot: string): AstroConfig {
  // Check cache first
  if (configCache.astroConfigs.has(projectRoot)) {
    return configCache.astroConfigs.get(projectRoot)!;
  }

  // Start with stable defaults
  const defaultConfig = createDefaultAstroConfig(projectRoot);
  let config: AstroConfig = { ...defaultConfig };
  
  try {
    const configPath = findAstroConfig(projectRoot);
    
    if (!configPath) {
      // Cache the default config
      configCache.astroConfigs.set(projectRoot, config);
      return config;
    }

    const configContent = readFileSync(configPath, 'utf-8');
    
    // Handle case where readFileSync returns non-string (for mocking compatibility)
    if (typeof configContent !== 'string') {
      configCache.astroConfigs.set(projectRoot, config);
      return config;
    }
    
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
    
    // Extract integrations - start with empty array and build up
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
    
    // Pattern 4: Look for specific content-related integrations (markdoc, mdx, asciidoc)
    const contentIntegrations = ['markdoc', 'mdx', 'asciidoc'];
    contentIntegrations.forEach(integration => {
      const importPattern = new RegExp(`import +\\w+ +from +['"](.*${integration}.*)['"],?[\n\r]`, 'i');
      const requirePattern = new RegExp(`require *\\( *['"](.*${integration}.*)['"] *\\)`, 'i');
      
      if (importPattern.test(configContent) || requirePattern.test(configContent)) {
        if (!integrations.includes(integration)) {
          integrations.push(integration);
        }
      }
    });
    
    // Update config with detected integrations
    config.integrations = integrations;
    
    // Detect contentDir - check if content collections directory exists
    try {
      const contentDir = join(projectRoot, 'src/content');
      if (existsSync(contentDir)) {
        config.contentDir = 'src/content';
      }
    } catch (error) {
      // Keep default contentDir if file system check fails
    }
    
  } catch (error) {
    // If any error occurs during config parsing, use the default config
    // This handles JSON parsing errors, file system errors, etc.
  }

  // Cache the result (either parsed config or default config)
  configCache.astroConfigs.set(projectRoot, config);
  return config;
}
