# Astro + Nx + pnpm Example

This example demonstrates how to use `astro-nx` to create and manage an Astro project within an Nx workspace using pnpm as the package manager.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm package manager installed globally

### Installation

1. **Install pnpm globally** (if not already installed)
   ```bash
   npm install -g pnpm
   ```

2. **Create a new Nx workspace**
   ```bash
   npx create-nx-workspace@latest astro-pnpm-example --preset=empty --packageManager=pnpm
   cd astro-pnpm-example
   ```

3. **Install the astro-nx plugin**
   ```bash
   pnpm add -D astro-nx
   ```

4. **Generate an Astro application**
   ```bash
   nx g astro-nx:init my-astro-app --packageManager=pnpm
   ```

### Project Structure

After running the generator, your project structure will look like:

```
astro-pnpm-example/
├── apps/
│   └── my-astro-app/
│       ├── src/
│       │   └── pages/
│       │       └── index.astro
│       ├── public/
│       │   └── favicon.svg
│       ├── astro.config.mjs
│       ├── package.json
│       ├── project.json
│       └── tsconfig.json
├── pnpm-lock.yaml
├── nx.json
├── package.json
└── tsconfig.base.json
```

## Available Commands

### Development

Start the development server:
```bash
nx dev my-astro-app
```

This will start the Astro development server on `http://localhost:4321` with:
- Hot module reloading
- TypeScript support
- File watching

### Build

Build the project for production:
```bash
nx build my-astro-app
```

This creates an optimized build in the `dist/` directory.

### Preview

Preview the production build:
```bash
nx preview my-astro-app
```

This serves the built files for testing the production build locally.

### Type Checking

Run Astro's type checking:
```bash
nx check my-astro-app
```

This checks TypeScript types and Astro-specific issues.

### Watch Mode

For continuous type checking:
```bash
nx check my-astro-app --watch
```

## Features Demonstrated

### 1. pnpm Integration

The example uses pnpm for all package management:
- Dependencies are installed with `pnpm install`
- New packages are added with `pnpm add`
- Scripts run through pnpm's optimized execution

### 2. Nx Integration

The project leverages Nx features:
- Project organization and structure
- Task execution with `nx`
- Dependency graph visualization
- Caching for faster builds

### 3. Astro Features

The generated project includes:
- Modern Astro configuration
- TypeScript support
- File-based routing
- Optimized build output

## Development Workflow

1. **Start development**
   ```bash
   nx dev my-astro-app
   ```

2. **Make changes** to files in `apps/my-astro-app/src/`

3. **See changes** automatically reflected in the browser

4. **Build for production**
   ```bash
   nx build my-astro-app
   ```

5. **Test production build**
   ```bash
   nx preview my-astro-app
   ```

## Customization

### Adding Dependencies

Add new dependencies with pnpm:
```bash
pnpm add @astrojs/react react react-dom
```

### Configuration

Modify `astro.config.mjs` to add integrations:
```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
});
```

### Styling

Add CSS frameworks or styling solutions:
```bash
pnpm add @astrojs/tailwind tailwindcss
```

### Additional Pages

Create new pages in `apps/my-astro-app/src/pages/`:
```astro
---
// apps/my-astro-app/src/pages/about.astro
---
<html>
  <head>
    <title>About</title>
  </head>
  <body>
    <h1>About Page</h1>
  </body>
</html>
```

## Performance

### pnpm Benefits

- Faster installation and resolution
- Efficient dependency management
- Optimized build processes

### Nx Benefits

- Intelligent build caching
- Parallel execution
- Dependency graph optimization

## Troubleshooting

### Common Issues

1. **pnpm not found**
   ```bash
   npm install -g pnpm
   ```

2. **Port already in use**
   ```bash
   nx dev my-astro-app --port 3000
   ```

3. **TypeScript errors**
   ```bash
   nx check my-astro-app
   ```

### Debug Mode

Run with debug information:
```bash
NX_VERBOSE_LOGGING=true nx dev my-astro-app
```

## Next Steps

1. **Add more pages** to your Astro application
2. **Install integrations** like React, Vue, or Svelte
3. **Configure styling** with Tailwind CSS or other frameworks
4. **Add more apps** to your Nx workspace
5. **Set up CI/CD** with your preferred platform

## Resources

- [Astro Documentation](https://docs.astro.build/)
- [Nx Documentation](https://nx.dev/)
- [pnpm Documentation](https://pnpm.io/)
- [astro-nx API Reference](../../docs/api-reference.md)

## Contributing

To contribute to this example:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This example is licensed under the MIT License.
