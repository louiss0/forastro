# API Reference

Complete reference for all generators and executors provided by `astro-nx`.

## Generators

### `init` Generator

Creates a new Astro project in your Nx workspace with modern package manager support.

#### Usage

```bash
nx g astro-nx:init [name] [options]
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | `string` | - | **Required.** The name of the project |
| `packageManager` | `'npm' \| 'yarn' \| 'pnpm'` | `'pnpm'` | Package manager to use for the project |
| `directory` | `string` | - | The directory where the project will be created |
| `tags` | `string` | - | Add tags to the project (used for linting) |
| `skipFormat` | `boolean` | `false` | Skip formatting files |

#### Examples

```bash
# Basic usage
nx g astro-nx:init my-app

# With custom directory
nx g astro-nx:init my-app --directory=apps/frontend

# With tags
nx g astro-nx:init my-app --tags="frontend,astro"

# With different package manager
nx g astro-nx:init my-app --packageManager=pnpm

# Skip formatting
nx g astro-nx:init my-app --skipFormat
```

#### Generated Files

The generator creates the following files:

- `astro.config.mjs` - Astro configuration
- `package.json` - Project dependencies
- `project.json` - Nx project configuration
- `tsconfig.json` - TypeScript configuration
- `src/pages/index.astro` - Default home page
- `public/favicon.svg` - Default favicon

## Executors

### `dev` Executor

Starts the Astro development server.

#### Usage

```bash
nx dev [project] [options]
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | `number` | `4321` | Port to run the development server on |
| `host` | `string` | `'localhost'` | Hostname to run the development server on |
| `open` | `boolean` | `false` | Open the browser after starting the server |

#### Examples

```bash
# Start development server
nx dev my-app

# Custom port
nx dev my-app --port=3000

# Custom host
nx dev my-app --host=0.0.0.0

# Open browser automatically
nx dev my-app --open
```

### `build` Executor

Builds the Astro project for production.

#### Usage

```bash
nx build [project] [options]
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `outDir` | `string` | `'dist'` | Output directory for the build |
| `mode` | `string` | `'production'` | Build mode |

#### Examples

```bash
# Build for production
nx build my-app

# Custom output directory
nx build my-app --outDir=build

# Development build
nx build my-app --mode=development
```

### `preview` Executor

Previews the built Astro project.

#### Usage

```bash
nx preview [project] [options]
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | `number` | `4321` | Port to run the preview server on |
| `host` | `string` | `'localhost'` | Hostname to run the preview server on |

#### Examples

```bash
# Preview production build
nx preview my-app

# Custom port
nx preview my-app --port=8080

# Custom host
nx preview my-app --host=0.0.0.0
```

### `check` Executor

Runs Astro check for TypeScript and other issues.

#### Usage

```bash
nx check [project] [options]
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `watch` | `boolean` | `false` | Watch for changes and re-run check |

#### Examples

```bash
# Run check once
nx check my-app

# Watch mode
nx check my-app --watch
```

## Configuration

### Project Configuration

The generated `project.json` includes all necessary targets:

```json
{
  "name": "my-app",
  "targets": {
    "dev": {
      "executor": "astro-nx:dev",
      "options": {}
    },
    "build": {
      "executor": "astro-nx:build",
      "options": {}
    },
    "preview": {
      "executor": "astro-nx:preview",
      "options": {}
    },
    "check": {
      "executor": "astro-nx:check",
      "options": {}
    }
  }
}
```

### Astro Configuration

The generated `astro.config.mjs` is compatible with Nx:

```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Astro configuration
});
```

### TypeScript Configuration

The generated `tsconfig.json` extends Astro's strict configuration:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "types": ["astro/client"]
  }
}
```

## Environment Variables

The plugin respects the following environment variables:

- `NODE_ENV` - Set to `'development'` or `'production'`
- `PORT` - Default port for development server
- `HOST` - Default host for development server

## Package Manager Integration

The plugin automatically detects and uses your chosen package manager commands:

- `pnpm install` - Install dependencies
- `pnpm add` - Add dependencies
- `pnpm remove` - Remove dependencies
- `pnpm run` - Run scripts

## Troubleshooting

### Common Error Messages

#### `Command 'pnpm' not found`
pnpm is not installed. Install it globally:
```bash
npm install -g pnpm
```

#### `Port 4321 is already in use`
Use a different port:
```bash
nx dev my-app --port=3000
```

#### `TypeScript errors in .astro files`
Make sure your `tsconfig.json` includes Astro types:
```json
{
  "compilerOptions": {
    "types": ["astro/client"]
  }
}
```
