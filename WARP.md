# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Table of Contents

1. [Monorepo Overview](#1-monorepo-overview)
2. [Project Structure](#2-project-structure)
3. [Development Commands](#3-development-commands)
4. [Packages Architecture](#4-packages-architecture)
5. [Apps Architecture](#5-apps-architecture)
6. [Git Flow Workflow](#6-git-flow-workflow)
7. [Commit Conventions](#7-commit-conventions)
8. [Release Management](#8-release-management)
9. [Build System Specifics](#9-build-system-specifics)
10. [CI/CD with GitHub Actions](#10-cicd-with-github-actions)
11. [Tags and Governance](#11-tags-and-governance)
12. [Shared Utilities](#12-shared-utilities)
13. [Contributing Guidelines](#13-contributing-guidelines)
14. [Appendix: Quick Reference](#14-appendix-quick-reference)

## 1. Monorepo Overview

This is an Nx workspace dedicated to creating and maintaining projects under the `@forastro/` scope. All packages are designed to make using Astro easier and more productive.

### Architecture

```
┌─── Apps ────────────────────┐    ┌─── Libraries ─────────────┐    ┌─── Shared ──────┐
│ astro-circle (logo gallery) │    │ @forastro/asciidoc        │    │ generateNewJSON │
│ blog (content site)         │────│ @forastro/utilities       │────│ tsup configs    │
│ docs (starlight + markdoc)  │    │ (+ paused libs)           │    │ eslint configs  │
│ my-site (personal)          │    │                           │    │ nx.json         │
└─────────────────────────────┘    └───────────────────────────┘    └─────────────────┘
```

### Key Features

- **Independent Package Releases**: Each library is versioned and published separately using Nx Release
- **Consistent Tooling**: TypeScript, tsup for bundling, Nx for orchestration, Conventional Commits for versioning
- **CI-Centric Workflow**: Uses Git Flow with frequent `develop` → `main` merges and CI automation
- **Package-Based Structure**: Even though using pnpm, packages are organized for optimal Astro integration

## 2. Project Structure

```
forastro/
├── apps/                           # Astro applications
│   ├── astro-circle/              # Logo gallery app
│   ├── blog/                      # Content blog site
│   ├── docs/                      # Documentation (Starlight + Markdoc)
│   └── my-site/                   # Personal site
├── packages/                      # Publishable npm packages
│   ├── asciidoc/                  # @forastro/asciidoc
│   └── utilities/                 # @forastro/utilities
├── templates/                     # Astro project templates
│   ├── astro-minimal/             # Basic Astro template
│   ├── astro-preact/              # Astro + Preact template
│   └── astro-mdx/                 # Astro + MDX template
├── tools/                         # Development tools
│   └── astro-nx/                  # Custom Nx plugin for Astro
├── shared/                        # Cross-package utilities
│   └── generateNewPackageJSON.ts  # Build transformation logic
├── .github/workflows/             # CI/CD pipelines
├── dist/                         # Build outputs (tsup generated)
├── nx.json                       # Nx workspace configuration
└── pnpm-lock.yaml               # Package manager lockfile
```

### Important Files

- **`shared/generateNewPackageJSON.ts`**: Reusable schema validation and package.json transformation logic
- **`nx.json`**: Defines release configuration, project tags, and build caching rules
- **`eslint.config.cjs`**: Shared ESLint configuration with TypeScript and Astro support
- **`tools/astro-nx/`**: Custom Nx plugin providing Astro-specific generators and executors
- **`templates/`**: Ready-to-use Astro project templates for different tech stacks

## 3. Development Commands

### Package Manager Preference

Use **JPD** when available, otherwise fallback to **pnpm**:

```bash
# Preferred installation
jpd i

# Fallback
pnpm i
```

### Nx Workspace Commands

```bash
# Discover projects and dependencies
npx nx show projects
npx nx graph

# Build commands
npx nx build <projectName>           # Single project
npx nx run-many -t build --all       # All projects
npx nx affected -t build             # Only changed projects

# Testing
npx nx test <projectName>
npx nx run-many -t test --all
npx nx affected -t test

# Linting
npx nx lint <projectName>
npx nx run-many -t lint --all
npx nx affected -t lint

# Development servers (use 'dev' target for Astro apps)
npx nx dev docs
npx nx dev blog
npx nx dev astro-circle
npx nx dev my-site

# App previews (built versions)
npx nx preview docs
npx nx preview blog  
npx nx preview astro-circle
npx nx preview my-site
```

### Package-Specific Commands

```bash
# Direct package builds
pnpm -C packages/asciidoc build
pnpm -C packages/utilities build

# Package testing (utilities example)
pnpm -C packages/utilities test
pnpm -C packages/utilities test:watch
pnpm -C packages/utilities test:coverage
```

## 4. Packages Architecture

### @forastro/asciidoc

**Version**: 0.0.3  
**Purpose**: Enable AsciiDoc usage with Astro, including syntax highlighting and CSS framework integrations.

**Dependencies**:
- Core: `asciidoctor`, `c12`, `fast-glob`, `prismjs`, `shiki`, `slugify`  
- Optional: `tailwindcss`, `unocss` (consumers can opt-in)
- Peer: `astro >5.0.0`

**Exports**:
```json
{
  ".": "./index.js",
  "./unocss": "./lib/unocss.js", 
  "./tailwind": "./lib/tailwind.js"
}
```

**Build Configuration**:
```javascript
// tsup.config.ts
{
  entry: {
    'index': './src/index.ts',
    'lib/unocss': './src/lib/unocss.ts',
    'lib/tailwind': './src/lib/tailwind.ts'
  },
  format: ['esm'],
  dts: true,
  minify: true,
  external: ['asciidoctor']  // Keep external for peer dependency
}
```

**Usage Examples**:
```javascript
// Main API
import { asciidocLoader } from '@forastro/asciidoc';

// UnoCSS integration
import { asciidocPreset } from '@forastro/asciidoc/unocss';

// Tailwind integration  
import { asciidocPlugin } from '@forastro/asciidoc/tailwind';
```

### @forastro/utilities

**Version**: 5.1.3  
**Purpose**: Set of tools and components specifically designed for Astro development.

**Structure**:
- `src/lib/`: Utility functions
- `src/components/`: Astro components
- Special: `useTemplaterAndProjector` has separate `.dts` and `.js` files for complex type requirements

**Exports**:
```json
{
  ".": "./src/index.ts",
  "./components": "./components/index.ts"  // Preserved in build transform
}
```

**Build Configuration**:
```javascript
// tsup.config.ts - Note: "components" is intentionally ignored in .ts→.js transform
{
  entry: ['./src/index.ts'],
  format: ['esm'],
  dts: true,
  minify: true,
  // onSuccess transforms package.json but ignores "components" export
}
```

**Testing**:
```bash
pnpm -C packages/utilities test         # Run tests
pnpm -C packages/utilities test:watch   # Watch mode
pnpm -C packages/utilities test:coverage # Coverage report
```

## 5. Apps Architecture

### astro-circle
**Purpose**: Gallery app for downloading Astro logo variants with framework overlays  
**Tags**: `type:app`, `scope:astro-circle`  
**Commands**: `npx nx dev astro-circle`, `npx nx build astro-circle`, `npx nx preview astro-circle`

### blog  
**Purpose**: Content blog site  
**Tags**: `type:app`, `scope:blog`  
**Commands**: `npx nx dev blog`, `npx nx build blog`, `npx nx preview blog`

### docs
**Purpose**: Documentation site using Astro Starlight with Markdoc for rendering Starlight components  
**Tags**: `astro:docs`  
**Content Structure**:
- `libraries/`: Package documentation (`index.mdoc` files with version frontmatter)
- `templates/`: Template documentation and usage guides  
**Commands**: `npx nx dev docs`, `npx nx build docs`

### my-site
**Purpose**: Personal website  
**Tags**: `type:app`, `scope:my-site`  
**Commands**: `npx nx dev my-site`, `npx nx build my-site`, `npx nx preview my-site`

## 6. Git Flow Workflow

This repository follows **Git Flow** using the `git-flow` CLI tool with a **CI-centric approach**.

### Installation

```bash
# macOS
brew install git-flow-avh

# Debian/Ubuntu  
sudo apt-get update && sudo apt-get install git-flow
```

### Initialize Git Flow

```bash
git flow init
# Accept defaults for main/develop branch names
```

### Feature Development

```bash
# Start feature
git flow feature start <scope>-<short-description>

# Publish for CI/PR (always push feature branches)
git flow feature publish <scope>-<short-description>

# Finish feature (merge to develop)
git flow feature finish <scope>-<short-description>
```

### CI-Centric Workflow

Since `.github/workflows/` is present, this repo uses **CI-centric** Git Flow:

- **No dedicated release branches** - frequent `develop` → `main` merges
- **Hotfixes**: Branch from `main`, fix, merge to `main` (deploy), then merge back to `develop`
- **Continuous deployment** from `main` branch

### Hotfix Workflow

```bash
# Critical production fixes
git flow hotfix start v<X.Y.Z>
# Make fixes, test thoroughly  
git flow hotfix finish v<X.Y.Z>
```

## 7. Commit Conventions

All commits must follow **Conventional Commits** with mandatory scopes:

### Format

```
<type>(<scope>)[!]: <subject ≤ 64 chars>

[optional body]

[optional footer]
```

### Types

- `feat`: New user-facing feature
- `fix`: Bug fix  
- `docs`: Documentation only
- `style`: Code formatting (no behavior change)
- `refactor`: Internal restructuring
- `perf`: Performance improvement
- `test`: Test changes only
- `build`: Build system/dependency changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks
- `revert`: Revert previous commit
- `remove`: Delete code/files/features
- `wip`: Work in progress
- `merge`: Branch merges

### Scopes

**Mandatory** lowercase scopes aligned with project structure:
- Package scopes: `@forastro/asciidoc`, `@forastro/utilities`
- App scopes: `astro-circle`, `blog`, `docs`, `my-site`
- System scopes: `ci`, `build`, `shared`

### Example

```
feat(@forastro/asciidoc): add unocss theme export

# Adds shiki-based highlighting alignment with UnoCSS presets

- Introduces lib/unocss export path
- Updates README usage examples  
- Adds TypeScript definitions

Closes #123
```

### Breaking Changes

Use `!` after scope or `BREAKING CHANGE:` in footer:

```
feat(@forastro/utilities)!: remove deprecated useTemplater API
```

## 8. Release Management

Releases use **Nx Release** with **independent versioning** powered by Conventional Commits.

### Release Commands

```bash
# Dry run to preview changes
npx nx release version --dryRun

# Version packages based on commits  
npx nx release version --yes --verbose

# Generate changelogs
npx nx release changelog --yes

# Publish to npm (requires NPM_TOKEN)
NPM_TOKEN=<token> npx nx release publish --yes
```

### Scoped Releases

```bash
# Release specific packages only
npx nx release version --projects=@forastro/asciidoc,@forastro/utilities --yes
```

### Complete Release Flow

```bash
# 1. Ensure clean build
npx nx run-many -t build --all
npx nx run-many -t test lint --all

# 2. Version and changelog  
npx nx release version --yes
npx release changelog --yes

# 3. Publish to npm
NPM_TOKEN=$NPM_TOKEN npx nx release publish --yes
```

### Semantic Versioning

Nx Release automatically determines version bumps:
- `feat:` → **minor** version bump
- `fix:` → **patch** version bump  
- `!` or `BREAKING CHANGE:` → **major** version bump

## 9. Build System Specifics

### tsup + Package.json Transformation

All packages use `tsup` with a shared transformation pipeline via `shared/generateNewPackageJSON.ts`.

### Build Script Validation

All package build scripts must match this pattern:
```regex
^tsup\s+--outDir\s+(?:\.*\/)*[a-z]+(?:\/[a-z]+)+
```

**Valid examples**:
- `tsup --outDir ../../dist/packages/asciidoc`
- `tsup --outDir ./lib/bundle`

### Export Path Transformation

The build system automatically transforms package.json exports:

1. **Remove `./src` prefix**: `./src/index.ts` → `./index.js`
2. **Convert `.ts` to `.js`**: For runtime consumption
3. **Preserve ignore list**: Certain exports (like `"components"` in utilities) skip `.ts`→`.js` conversion
4. **Maintain types field**: TypeScript definitions preserved

### tsup Configuration Pattern

```javascript
export default defineConfig((ctx) => ({
  entry: { /* ... */ },
  format: ['esm'],
  dts: true,
  minify: true,  
  clean: true,
  external: ['asciidoctor'], // Keep peer deps external
  async onSuccess() {
    // Transform and write package.json to output directory
    const transformed = transformPackageJSON_ExportsForBuild(packageJSON, ignoreList);
    fs.writeFileSync(`${ctx.outDir}/package.json`, JSON.stringify(transformed, null, 2));
  }
}));
```

## 10. CI/CD with GitHub Actions

### Current CI Workflow

The existing CI workflow (`.github/workflows/ci.yml`) runs on pushes and PRs:

```yaml
name: CI
on:
  push: { branches: [main, master] }
  pull_request: { branches: [main, master] }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: 
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm nx affected -t lint --parallel --exclude=astro-nx
      - run: pnpm nx affected -t test --parallel --exclude=astro-nx  
      - run: pnpm nx affected -t check --parallel
      - run: pnpm nx affected -t build --parallel
```

### Recommended Release Workflow

```yaml
name: Release
on:
  workflow_dispatch:
  push:
    tags: ['v*']
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      packages: write
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm i --frozen-lockfile
      - run: npx nx run-many -t build --all
      - run: npx nx release version --yes
      - run: npx nx release changelog --yes  
      - run: npx nx release publish --yes
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 11. Tags and Governance

### Library Status Tags

Projects use tags to indicate maintenance status:

- **`nx:lib:ongoing`**: Actively maintained, included in releases
- **`nx:lib:paused`**: Maintenance paused, excluded from default operations

### Tag Configuration

Applied in each library's `project.json`:

```json
{
  "name": "@forastro/asciidoc", 
  "tags": ["nx:lib", "nx:lib:ongoing"],
  "release": {
    "version": {
      "currentVersionResolver": "git-tag"
    }
  }
}
```

### Tag-Based Operations

```bash
# Show projects by tag
npx nx show projects --withTag nx:lib:ongoing

# Build only ongoing libraries
npx nx run-many -t build -p $(npx nx show projects --withTag nx:lib:ongoing)

# Release configuration targets ongoing libs automatically
npx nx release version  # Only processes nx:lib:ongoing tagged projects
```

## 12. Shared Utilities

### generateNewPackageJSON.ts

Located in `shared/generateNewPackageJSON.ts`, provides:

**`createPackageJsonSchema(buildRegexString, buildRegexMessage)`**
- Creates Zod schema for package.json validation
- Validates build script format, exports structure, metadata fields

**`transformPackageJSON_ExportsForBuild(data, valuesToIgnoreInExports)`** 
- Removes `./src` prefix from export paths
- Converts `.ts` extensions to `.js` in exports
- Preserves specified exports in ignore list
- Used by all package tsup configurations

**Usage in tsup configs**:
```javascript
import { createPackageJsonSchema, transformPackageJSON_ExportsForBuild } from '../../shared/generateNewPackageJSON';

const schema = createPackageJsonSchema(BUILD_REGEX_STRING, BUILD_REGEX_MESSAGE);
// ... in onSuccess hook
const transformed = transformPackageJSON_ExportsForBuild(packageJSON, ['components']);
```

### Templates

The `templates/` directory contains ready-to-use Astro project templates:

- **`astro-minimal/`**: Basic Astro template with minimal configuration
- **`astro-preact/`**: Astro template with Preact integration
- **`astro-mdx/`**: Astro template with MDX support

Each template includes:
- Pre-configured `astro.config.mjs`
- TypeScript configuration
- UnoCSS setup
- Package dependencies

### Tools: astro-nx Plugin

Located in `tools/astro-nx/`, this is a custom Nx plugin providing:
- Astro-specific generators for creating components, pages, and content files
- Custom executors for `dev` and `preview` targets
- Template management and scaffolding utilities

**Usage**:
```bash
# Generate new Astro component
npx nx g @forastro/astro-nx:component my-component

# Generate new page
npx nx g @forastro/astro-nx:page my-page
```

## 13. Contributing Guidelines

### Development Environment

**Editor**: Micro with plugins (lsp, wakatime, detectindent, fzf, jump)  
**Themes**: Nord or Dracula  
**Package Manager**: JPD preferred, pnpm fallback  
**OS Packages**: Flatpak for apps (local preferred), Nix for executables on Linux

### Dotfiles Management

```bash
# Setup with yadm
yadm clone <dotfiles-repo>
yadm bootstrap
```

### Code Philosophy

- **Clarity over cleverness**: Write self-documenting code
- **Declarative style**: Prefer APIs/methods over manual loops
- **State management**: Keep changes close to state creation
- **Conceptual organization**: Group by features/modules
- **Test-first**: Write tests before implementation
- **80%+ test coverage**: 60% minimum acceptable

### Testing Strategy

This repository uses **Vitest** with **V8 coverage** for comprehensive testing across packages.

#### Coverage Policy

- **.astro components are intentionally excluded** from tests/coverage to avoid experimental component testing complexities
- **Focus on TypeScript modules**: utilities, loaders, schemas, plugins, and internal functions
- **Realistic thresholds based on testable code**: Coverage requirements vary by package based on complexity

#### Package Testing Configuration

**@forastro/utilities**:
- **Coverage Target**: 80% lines/statements/branches/functions
- **Test Environment**: Node.js
- **Focus Areas**: Utility functions, hooks, internal helpers, export validation

**@forastro/asciidoc**:
- **Coverage Target**: 70% lines/statements, 85% branches, 50% functions
- **Test Environment**: Node.js with extensive mocking
- **Focus Areas**: Schema validation, attribute normalization, plugin registration, utility functions
- **Complex loader integration tests are disabled** due to mocking complexity with AsciidocProcessorController

#### Running Tests

```bash
# Package-specific testing
pnpm -C packages/utilities test:coverage
pnpm -C packages/asciidoc test:coverage

# Workspace-wide testing
npx nx affected -t test --parallel
npx nx run-many -t test --all

# Continuous testing
pnpm -C packages/utilities test:watch
```

#### Test Structure

- **Unit tests**: `src/__tests__/*.test.ts`
- **Fixtures**: `src/__fixtures__/` (excluded from coverage)
- **Mock strategy**: Mock external dependencies (fs, asciidoctor, c12) for deterministic tests
- **Focus on public APIs**: Test exported functions and classes, not internal implementation details

### Accessibility Standards

- **Semantic HTML**: Use appropriate elements for content structure
- **ARIA compliance**: Proper labeling and roles
- **Keyboard navigation**: All interactive elements accessible
- **Screen reader compatibility**: Meaningful alt text and descriptions

## 14. Appendix: Quick Reference

### Nx Commands

```bash
# Project discovery
npx nx show projects
npx nx show projects --withTag nx:lib:ongoing  
npx nx graph

# Task execution
npx nx run-many -t build --all
npx nx affected -t lint test build
npx nx run <project>:<target>

# App development (use 'dev' not 'serve' for Astro apps)
npx nx dev <app-name>
npx nx build <app-name>
npx nx preview <app-name>
```

### Git Flow Commands

```bash
git flow init
git flow feature start <scope>-<description>
git flow feature publish <scope>-<description>
git flow feature finish <scope>-<description>
git flow hotfix start v<X.Y.Z>
git flow hotfix finish v<X.Y.Z>
```

### Release Commands

```bash
# Version and publish flow
npx nx release version --dryRun        # Preview
npx nx release version --yes           # Apply versions
npx nx release changelog --yes         # Generate changelogs  
NPM_TOKEN=<token> npx nx release publish --yes  # Publish to npm

# Scoped releases
npx nx release version --projects=@forastro/asciidoc --yes
```

### Package Build Commands

```bash
# Direct package builds
pnpm -C packages/asciidoc build
pnpm -C packages/utilities build

# Build script requirements
# Must match: tsup --outDir <path-with-2+-segments>
```

### Environment Setup

```bash
# Package manager installation
jpd i          # Preferred
pnpm i         # Fallback  

# Git Flow installation  
brew install git-flow-avh                           # macOS
sudo apt-get update && sudo apt-get install git-flow # Linux
```

---

**Last Updated**: August 31, 2025  
**Nx Version**: 21.3.11  
**Node Version**: 20+  
**pnpm Version**: 9+
