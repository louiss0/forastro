# @forastro/astro-nx

## Why

**Wrap Astro CLI for Nx with powerful generators.** This plugin bridges the gap between Astro's excellent development experience and Nx's powerful build system, providing seamless integration for Astro projects in monorepos. It enhances the standard Astro workflow with intelligent code generation, consistent project structure, and optimized caching.

## What - Subcommands

### Core Executors

- **`dev`** - Start Astro development server with hot reload
- **`build`** - Build Astro project for production
- **`preview`** - Preview production build locally
- **`check`** - Run TypeScript and component validation

### Powerful Generators

- **`page`** - Generate Astro pages with routing structure
- **`component`** - Generate reusable Astro components with props
- **`content-file`** - Generate content files for collections (md/adoc/mdx/mdoc)
- **`astro-file`** - Unified generator with intelligent detection and bulk operations

## How - Flags and Usage

### Development Workflow

**Start development server:**
```bash
nx run my-site:dev
nx run my-site:dev --port=4321
nx run my-site:dev --host=0.0.0.0 --port=3000
```

**Build for production:**
```bash
nx run my-site:build
nx run my-site:build --outDir=custom-dist
```

**Preview production build:**
```bash
nx run my-site:preview
nx run my-site:preview --port=8080
```

**Validate project:**
```bash
nx run my-site:check
nx run my-site:check --verbose
nx run my-site:check --config=astro.custom.config.mjs
```

### Code Generation Examples

**Generate pages:**
```bash
# Basic page
nx g @forastro/astro-nx:page about --project=my-site

# Page with custom layout
nx g @forastro/astro-nx:page contact --project=my-site --layout=BaseLayout

# Page in subdirectory
nx g @forastro/astro-nx:page blog/post --project=my-site
```

**Generate components:**
```bash
# Simple component
nx g @forastro/astro-nx:component Button --project=my-site

# Component with TypeScript props
nx g @forastro/astro-nx:component Button --project=my-site --props="label:string, onClick:() => void"

# Component with complex props
nx g @forastro/astro-nx:component Card --project=my-site --props="title:string, content:string, variant:'primary'|'secondary', isDisabled?:boolean"
```

**Generate content files:**
```bash
# Blog post
nx g @forastro/astro-nx:content-file post-1 --project=my-site --collection=blog

# Documentation with AsciiDoc
nx g @forastro/astro-nx:content-file api-guide --project=my-site --collection=docs --format=adoc

# Product entry
nx g @forastro/astro-nx:content-file laptop-pro --project=my-site --collection=products --format=mdx
```

**Bulk operations:**
```bash
# Generate pages across multiple projects
nx g @forastro/astro-nx:astro-file --kind=page --name=changelog --bulk --projects=my-site,my-docs

# Generate components in bulk
nx g @forastro/astro-nx:astro-file --kind=component --name=Footer --bulk --projects=my-site,marketing-site

# Generate content files across projects
nx g @forastro/astro-nx:astro-file --kind=content-file --name=privacy-policy --bulk --projects=my-site,my-docs --collection=legal
```

## Detailed Executor Schemas

### dev Executor

**Schema Options:**
- `port` (number): Port to run development server (default: 4321)
- `host` (string): Host to bind server to (default: localhost)
- `config` (string): Path to Astro config file
- `open` (boolean): Open browser on server start
- `logLevel` (string): Log level - 'debug' | 'info' | 'warn' | 'error' | 'silent'

### build Executor

**Schema Options:**
- `config` (string): Path to Astro config file
- `outDir` (string): Output directory for build files
- `mode` (string): Build mode - 'development' | 'production'
- `logLevel` (string): Log level - 'debug' | 'info' | 'warn' | 'error' | 'silent'

### preview Executor

**Schema Options:**
- `port` (number): Port to run preview server (default: 4321)
- `host` (string): Host to bind server to
- `config` (string): Path to Astro config file
- `open` (boolean): Open browser on server start

### check Executor

**Schema Options:**
- `config` (string): Path to Astro config file
- `verbose` (boolean): Enable verbose logging and generate report file
- `tsconfig` (string): Path to TypeScript configuration file
- `flags` (array): Additional flags to pass to astro check

**Features:**
- **Cacheable**: Skips re-running if no changes detected
- **CI Integration**: Generates `.astro-check` report file for CI pipelines
- **Type Safety**: Validates TypeScript and Astro component usage

**Examples:**
```bash
# Basic check
nx check my-astro-app

# Verbose check with report generation
nx check my-astro-app --verbose

# Check with custom config
nx check my-astro-app --config astro.custom.config.mjs

# Check with custom tsconfig
nx check my-astro-app --tsconfig tsconfig.custom.json
```

**Report Format:**
When verbose mode is enabled, the executor generates a report at `{projectRoot}/.astro-check` containing:
- Generation timestamp
- Project name
- Exit code
- Complete output from the check command
- Debug information (when verbose)

This is especially useful for CI environments where you need to capture and review check results.

## Generator Schemas

### page Generator

**Schema Options:**
- `name` (string, required): Page name and route path
- `project` (string, required): Target Nx project
- `directory` (string): Subdirectory within pages (default: '')
- `layout` (string): Layout component to use
- `frontmatter` (object): Custom frontmatter properties
- `template` (string): Page template type - 'basic' | 'blog' | 'landing'

**Generated Files:**
- `src/pages/{directory}/{name}.astro`
- Automatic route generation based on file path

### component Generator

**Schema Options:**
- `name` (string, required): Component name (PascalCase)
- `project` (string, required): Target Nx project
- `directory` (string): Subdirectory within components (default: '')
- `props` (string): TypeScript interface for component props
- `styles` (boolean): Include component-scoped styles (default: true)
- `script` (boolean): Include component script section (default: true)

**Generated Files:**
- `src/components/{directory}/{name}.astro`
- Properly typed props interface
- Scoped styling setup

### content-file Generator

**Schema Options:**
- `name` (string, required): Content file name
- `project` (string, required): Target Nx project
- `collection` (string, required): Content collection name
- `format` (string): File format - 'md' | 'mdx' | 'adoc' | 'mdoc' (default: 'md')
- `frontmatter` (object): Custom frontmatter schema
- `draft` (boolean): Mark as draft content (default: false)

**Generated Files:**
- `src/content/{collection}/{name}.{format}`
- Collection-specific frontmatter schema
- Content validation setup

### astro-file Generator (Unified)

**Schema Options:**
- `kind` (string, required): Generation type - 'page' | 'component' | 'content-file'
- `name` (string, required): File name
- `bulk` (boolean): Enable bulk generation across projects
- `projects` (string): Comma-separated list of target projects (required when bulk=true)
- `collection` (string): Content collection (required when kind='content-file')
- `props` (string): Component props (when kind='component')
- `directory` (string): Target directory

**Bulk Operation Features:**
- Generate identical files across multiple projects
- Consistent naming and structure
- Parallel generation for performance
- Automatic project validation

## Installation & Setup

### Within forastro Monorepo

1. **Build the plugin:**
```bash
pnpm exec nx build astro-nx
```

2. **Configure in project.json:**
```json
{
  "targets": {
    "dev": {
      "executor": "@forastro/astro-nx:dev",
      "options": {
        "port": 4321
      }
    },
    "build": {
      "executor": "@forastro/astro-nx:build",
      "cache": true,
      "outputs": ["{projectRoot}/dist"]
    },
    "preview": {
      "executor": "@forastro/astro-nx:preview",
      "dependsOn": ["build"]
    },
    "check": {
      "executor": "@forastro/astro-nx:check",
      "cache": true,
      "outputs": ["{projectRoot}/.astro-check"]
    }
  }
}
```

### External Installation

```bash
npm install @forastro/astro-nx
# or
yarn add @forastro/astro-nx
# or
pnpm add @forastro/astro-nx
```

## Requirements

- **Node.js**: ^18.17.1 || ^20.3.0 || >=21.0.0
- **Nx**: ^18.0.0
- **Astro**: ^4.0.0
- **@astrojs/check**: Required for check executor
- **TypeScript**: ^5.0.0 (recommended)

## Building & Testing

```bash
# Build the plugin
nx build astro-nx

# Run unit tests
nx test astro-nx
```
