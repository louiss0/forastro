import { join } from 'path';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { findAstroConfig, readAstroConfig, readIntegrations } from './config';

describe('Astro Config Detection', () => {
  const tempDir = join(__dirname, 'temp-test');
  
  beforeEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    mkdirSync(tempDir, { recursive: true });
  });
  
  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
  
  describe('findAstroConfig', () => {
    test('should find astro.config.mjs file', () => {
      const configPath = join(tempDir, 'astro.config.mjs');
      writeFileSync(configPath, 'export default {};');
      
      const result = findAstroConfig(tempDir);
      expect(result).toBe(configPath);
    });
    
    test('should find astro.config.ts file', () => {
      const configPath = join(tempDir, 'astro.config.ts');
      writeFileSync(configPath, 'export default {};');
      
      const result = findAstroConfig(tempDir);
      expect(result).toBe(configPath);
    });
    
    test('should return null if no config file found', () => {
      const result = findAstroConfig(tempDir);
      expect(result).toBeNull();
    });
    
    test('should prefer .ts over .mjs', () => {
      const mjsPath = join(tempDir, 'astro.config.mjs');
      const tsPath = join(tempDir, 'astro.config.ts');
      
      writeFileSync(mjsPath, 'export default {};');
      writeFileSync(tsPath, 'export default {};');
      
      const result = findAstroConfig(tempDir);
      expect(result).toBe(tsPath);
    });
  });
  
  describe('readAstroConfig', () => {
    test('should parse site configuration', () => {
      const configContent = `
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://example.com'
});
`;
      const configPath = join(tempDir, 'astro.config.mjs');
      writeFileSync(configPath, configContent);
      
      const result = readAstroConfig(tempDir);
      expect(result.site).toBe('https://example.com');
    });
    
    test('should parse base configuration', () => {
      const configContent = `
import { defineConfig } from 'astro/config';

export default defineConfig({
  base: '/docs'
});
`;
      const configPath = join(tempDir, 'astro.config.mjs');
      writeFileSync(configPath, configContent);
      
      const result = readAstroConfig(tempDir);
      expect(result.base).toBe('/docs');
    });
    
    test('should parse integrations from imports and function calls', () => {
      const configContent = `
import { defineConfig } from 'astro/config';
import markdoc from '@astrojs/markdoc';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [markdoc(), mdx()]
});
`;
      const configPath = join(tempDir, 'astro.config.mjs');
      writeFileSync(configPath, configContent);
      
      const result = readAstroConfig(tempDir);
      expect(result.integrations).toEqual(expect.arrayContaining(['markdoc', 'mdx']));
    });
    
    test('should detect contentDir when src/content exists', () => {
      const configPath = join(tempDir, 'astro.config.mjs');
      writeFileSync(configPath, 'export default {};');
      
      const contentDir = join(tempDir, 'src/content');
      mkdirSync(contentDir, { recursive: true });
      
      const result = readAstroConfig(tempDir);
      expect(result.contentDir).toBe('src/content');
    });
    
    test('should return empty config when no file exists', () => {
      const result = readAstroConfig(tempDir);
      expect(result).toEqual({});
    });
  });
  
  describe('readIntegrations', () => {
    test('should parse integrations correctly', () => {
      const configContent = `
import { defineConfig } from 'astro/config';
import markdoc from '@astrojs/markdoc';

export default defineConfig({
  integrations: [markdoc()]
});
`;
      const configPath = join(tempDir, 'astro.config.mjs');
      writeFileSync(configPath, configContent);
      
      const result = readIntegrations(tempDir);
      expect(result).toContain('markdoc');
    });
  });
});
