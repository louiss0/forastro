# Astro Configuration Detection

This document describes the enhanced Astro configuration detection feature implemented for the Astro NX plugin.

## Overview

The plugin now includes robust configuration detection that respects Astro configuration files and provides intelligent defaults for executors and generators.

## Features

### Configuration Detection (`readAstroConfig`)

The `readAstroConfig()` function performs best-effort scanning of Astro config files to detect:

- **Site URL**: `site` configuration option
- **Base path**: `base` configuration option  
- **Output directory**: `outDir` configuration option (less common)
- **Integrations**: Detects integrations like `markdoc`, `mdx`, `asciidoc` from imports and usage
- **Content directory**: Automatically detects `src/content` directory existence

### Integration Detection

The system detects the following content-related integrations:
- `@astrojs/markdoc` → `markdoc` 
- `@astrojs/mdx` → `mdx`
- `@astrojs/asciidoc` → `asciidoc` (if available)

Detection works through:
1. Import statements (`import markdoc from '@astrojs/markdoc'`)
2. Require calls (`require('@astrojs/markdoc')`) 
3. Integration function calls in the `integrations` array
4. Pattern matching for content-related packages

## Executor Behavior

### Core Principle
**Executors only pass flags that are explicitly provided by the user. They do not override Astro defaults with detected config values.**

This ensures:
- Astro's default behavior is preserved
- Users can rely on standard Astro configuration 
- Explicit flags take precedence when provided

### Updated Executors

- **Build Executor**: Respects user-provided `--site`, `--base`, `--outDir` flags only
- **Dev Executor**: Respects user-provided `--port`, `--host`, `--config` flags only  
- **Check Executor**: Respects user-provided `--config`, `--tsconfig` flags only

## Generator Enhancements

### Content File Generator

- **Extension Detection**: Prefers detected integrations for default file extensions
  - If `mdx` integration detected → defaults to `.mdx`
  - If `markdoc` integration detected → defaults to `.mdoc`
  - If `asciidoc` integration detected → defaults to `.adoc`
  - Otherwise defaults to `.md`

- **Content Directory**: Uses detected `contentDir` or falls back to `src/content`

### Page Generator

- **Extension Detection**: Same logic as content file generator
- **Layout Defaults**: Can leverage detected configuration for layout patterns

## API Reference

### `findAstroConfig(projectRoot: string): string | null`
Locates the Astro configuration file in priority order:
1. `astro.config.ts`
2. `astro.config.mjs`
3. `astro.config.cjs` 
4. `astro.config.js`

### `readAstroConfig(projectRoot: string): AstroConfig`
Returns parsed configuration object with detected values:

```typescript
interface AstroConfig {
  site?: string;           // Site URL
  base?: string;           // Base path  
  outDir?: string;         // Output directory
  integrations?: string[]; // Detected integrations
  contentDir?: string;     // Content collections directory
}
```

### `readIntegrations(projectRoot: string): string[]`
Convenience function that returns just the integrations array.

## Examples

### Detected Configuration
For a config file like:
```javascript
import { defineConfig } from 'astro/config';
import markdoc from '@astrojs/markdoc';

export default defineConfig({
  site: 'https://example.com',
  base: '/docs',
  integrations: [markdoc()]
});
```

Detection returns:
```javascript
{
  site: 'https://example.com',
  base: '/docs', 
  integrations: ['markdoc'],
  contentDir: 'src/content' // if directory exists
}
```

### Generator Behavior
When generating a content file:
- If `markdoc` integration detected → creates `.mdoc` file
- Uses detected content directory path
- Applies appropriate frontmatter patterns

## Testing

Unit tests are provided in `config.spec.ts` to verify:
- Configuration file discovery
- Configuration parsing accuracy
- Integration detection
- Content directory detection
- Error handling

## Future Enhancements

Potential areas for future improvement:
- Layout detection from existing pages
- Custom content directory configuration parsing
- Integration-specific configuration detection
- Frontmatter pattern learning from existing content
