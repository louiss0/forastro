# 2.0.0 (2025-10-09)

### 🩹 Fixes

- ⚠️  **packages/nx-astro-plugin:** remove invalid production inputs and fix component prompting ([66808a0](https://github.com/louiss0/forastro/commit/66808a0))
- ⚠️  **packages/nx-astro-plugin:** add .js extensions to ESM imports ([f2583c8](https://github.com/louiss0/forastro/commit/f2583c8))

### ⚠️  Breaking Changes

- **packages/nx-astro-plugin:** None

### ❤️ Thank You

- Shelton Louis @louiss0

# 1.0.0 (2025-10-09)

### 🚀 Features

- **nx-astro-plugin:** implement Starlight docs generator ([d4d63ad](https://github.com/louiss0/forastro/commit/d4d63ad))
- **nx-astro-plugin:** enhance page generator with layout support ([833d9a2](https://github.com/louiss0/forastro/commit/833d9a2))
- **nx-astro-plugin:** add layout types with SEO support ([e5545e4](https://github.com/louiss0/forastro/commit/e5545e4))
- **nx-astro-plugin:** enhance component generator with framework support ([854a5aa](https://github.com/louiss0/forastro/commit/854a5aa))
- ⚠️  **nx-astro-plugin:** implement content generator with validation ([56bd368](https://github.com/louiss0/forastro/commit/56bd368))
- **nx-astro-plugin:** add content generator with validation ([7054438](https://github.com/louiss0/forastro/commit/7054438))
- ⚠️  **nx-astro-plugin:** add static and dynamic page types with dir detection ([53720f1](https://github.com/louiss0/forastro/commit/53720f1))

### 🩹 Fixes

- **nx-astro-plugin:** flatten build output structure and fix template paths ([65bd339](https://github.com/louiss0/forastro/commit/65bd339))
- **nx-astro-plugin:** correct packaging paths for distribution ([486e8a0](https://github.com/louiss0/forastro/commit/486e8a0))
- **nx-astro-plugin:** run create-astro before project.json ([4cd5e23](https://github.com/louiss0/forastro/commit/4cd5e23))

### ⚠️  Breaking Changes

- **nx-astro-plugin:** The 'generate-content' generator has been renamed to 'content'. Update your workspace configuration to use the new name.
- **nx-astro-plugin:** none

### ❤️ Thank You

- Shelton Louis @louiss0

## [Unreleased]

### 🚀 Features

- **page generator:** add static and dynamic page type support with directory detection
  - Generate static pages with frontmatter and placeholder content
  - Generate dynamic pages with `getStaticPaths()` for content collections
  - Auto-detect `srcDir` from astro.config files
  - Support custom directory paths
- **content generator:** add content type validation and multiple format support
  - Validate collections exist before generating content
  - Support markdown, MDX, Markdoc, and AsciiDoc formats
  - Detect required integrations and provide installation instructions
  - Generate appropriate frontmatter for each content type
  - Automatic name slugification

### 🔄 Changes

- **content generator:** rename `generate-content` to `content` for consistency

### 🛠️ Internal

- Add utility functions for Astro config parsing
- Add content collection detection
- Add content type support detection
- Comprehensive test coverage for all new features (87.97% overall)

## 0.1.1 (2025-10-07)

### 🩹 Fixes

- **nx-astro-plugin:** remove circular build script from package.json ([d61c0a5](https://github.com/louiss0/forastro/commit/d61c0a5))

### ❤️ Thank You

- Shelton Louis @louiss0

## 0.1.0 (2025-10-06)

### 🚀 Features

- **nx-astro-plugin:** Nx Astro plugin and sample app; enable release dry-run ([#48](https://github.com/louiss0/forastro/pull/48))
- **nx-astro-plugin/package:** set type module and exports; add scripts ([731ea10](https://github.com/louiss0/forastro/commit/731ea10))
- **asciidoc:** enhance package with build outputs and configuration updates ([281c7b8](https://github.com/louiss0/forastro/commit/281c7b8))
- **build:** configure nx release and package publishing ([8c11156](https://github.com/louiss0/forastro/commit/8c11156))
- **nx-astro-plugin:** integrate astro-nx plugin into forastro monorepo ([9885109](https://github.com/louiss0/forastro/commit/9885109))

### 🩹 Fixes

- **nx-astro-plugin:** make executor imports extensionless for TS runtime resolution (CI) ([f8f6b6a](https://github.com/louiss0/forastro/commit/f8f6b6a))
- **nx-astro-plugin): use src paths in executors/generators for CI; align allowGlobal default to true and update tests fix(mock-blog:** resolve merge conflict in astro.config.mjs ([342c16e](https://github.com/louiss0/forastro/commit/342c16e))
- **nx-astro-plugin:** guard formatFiles in generate-content to prevent ESM \_\_dirname issues in CI ([12c7613](https://github.com/louiss0/forastro/commit/12c7613))
- **nx-astro-plugin:** replace \_\_dirname usage in generate-content with import.meta.url ([4363b2a](https://github.com/louiss0/forastro/commit/4363b2a))
- **nx-astro-plugin:** use resolveAstroBinary in add-integration ([01b45e7](https://github.com/louiss0/forastro/commit/01b45e7))
- **nx-astro-plugin:** remove lint target to align with monorepo patterns ([2e4c6fd](https://github.com/louiss0/forastro/commit/2e4c6fd))
- **nx-astro-plugin/tsconfig:** align TypeScript configuration with monorepo patterns ([0318e44](https://github.com/louiss0/forastro/commit/0318e44))

### ❤️ Thank You

- shelton louis @louiss0
- Shelton Louis @louiss0
