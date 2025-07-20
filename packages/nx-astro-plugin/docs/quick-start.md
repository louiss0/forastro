# Quick Start Guide

Get up and running with `astro-nx` in minutes.

## Prerequisites

- Node.js 18+ 
- pnpm package manager installed
- Nx workspace (optional, can be created during setup)

## Installation

Install the plugin using pnpm:

```bash
pnpm add -D astro-nx
```

## Creating Your First Astro Project

### In an existing Nx workspace

```bash
nx g astro-nx:init my-app --packageManager=pnpm
```

### In a new workspace

```bash
# Create new Nx workspace
npx create-nx-workspace@latest my-workspace --preset=empty --packageManager=pnpm

# Navigate to workspace
cd my-workspace

# Add the plugin
pnpm add -D astro-nx

# Generate Astro app
nx g astro-nx:init my-app --packageManager=pnpm
```

## Project Structure

After running the generator, your project will have the following structure:

```
my-app/
├── src/
│   └── pages/
│       └── index.astro
├── public/
│   └── favicon.svg
├── astro.config.mjs
├── package.json
├── project.json
└── tsconfig.json
```

## Available Commands

Once your project is created, you can run:

```bash
# Start development server
nx dev my-app

# Build for production
nx build my-app

# Preview production build
nx preview my-app

# Run Astro check
nx check my-app
```

## What's Next?

- Check out the [API Reference](./api-reference.md) for detailed configuration options
- View the [Migration Guide](./migration-guide.md) if you're migrating from other setups
- Explore the [example project](../examples/with-pnpm/README.md) for a complete working example

## Common Issues

### pnpm not found
If you get a "pnpm not found" error, make sure pnpm is installed globally:

```bash
npm install -g pnpm
```

### Port already in use
If port 4321 is already in use, Astro will automatically find the next available port. You can also specify a port:

```bash
nx dev my-app --port 3000
```

### TypeScript errors
Make sure your `tsconfig.json` includes the proper Astro types:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "types": ["astro/client"]
  }
}
```
