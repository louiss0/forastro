# Migration Guide

This guide helps you migrate from various Astro setups to `astro-nx`.

## From Standalone Astro Project

### Before Migration

Your current project structure might look like:

```
my-astro-project/
├── src/
│   └── pages/
│       └── index.astro
├── public/
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

### Migration Steps

1. **Create an Nx workspace**
   ```bash
   npx create-nx-workspace@latest my-workspace --preset=empty --packageManager=pnpm
   cd my-workspace
   ```

2. **Install the plugin**
   ```bash
   pnpm add -D astro-nx
   ```

3. **Generate a new Astro project**
   ```bash
   nx g astro-nx:init my-app --packageManager=pnpm
   ```

4. **Copy your existing code**
   ```bash
   # Copy source files
   cp -r /path/to/old-project/src/* apps/my-app/src/
   
   # Copy public assets
   cp -r /path/to/old-project/public/* apps/my-app/public/
   
   # Copy configuration (review and merge)
   cp /path/to/old-project/astro.config.mjs apps/my-app/
   ```

5. **Update dependencies**
   ```bash
   # Add your project-specific dependencies
   pnpm add your-dependencies
   ```

6. **Test the migration**
   ```bash
   nx dev my-app
   nx build my-app
   ```

## From Nx Workspace with Different Package Manager

### From npm/yarn to pnpm

1. **Install pnpm globally**
   ```bash
   npm install -g pnpm
   ```

2. **Convert package.json dependencies**
   ```bash
   # Remove old node_modules and lock files
   rm -rf node_modules package-lock.json yarn.lock
   
   # Install with pnpm
   pnpm install
   ```

3. **Update nx.json**
   ```json
   {
     "cli": {
       "packageManager": "pnpm"
     }
   }
   ```

4. **Update existing Astro projects**
   ```bash
   # For each existing Astro project
   nx g astro-nx:init existing-app --packageManager=pnpm --directory=apps/existing-app
   ```

## From @nx/astro (if it existed)

### Key Differences

| Feature | @nx/astro | astro-nx |
|---------|-----------|--------------|
| Package Manager | npm/yarn/pnpm | pnpm-optimized |
| Configuration | Standard Nx | Modern package manager integrated |
| Commands | `nx dev` | `nx dev` (pnpm-powered) |
| Dependencies | Standard | pnpm-managed |

### Migration Steps

1. **Remove old plugin**
   ```bash
   pnpm remove @nx/astro
   ```

2. **Install new plugin**
   ```bash
   pnpm add -D astro-nx
   ```

3. **Update project configurations**
   ```bash
   # Update each project's project.json
   # Replace executor references from @nx/astro to astro-nx
   ```

4. **Test all projects**
   ```bash
   nx dev your-project
   nx build your-project
   ```

## From Astro + Nx manually configured

### Before Migration

If you manually configured Astro in Nx, you might have:

```json
// project.json
{
  "targets": {
    "dev": {
      "executor": "nx:run-commands",
      "options": {
        "command": "astro dev"
      }
    },
    "build": {
      "executor": "nx:run-commands",
      "options": {
        "command": "astro build"
      }
    }
  }
}
```

### Migration Steps

1. **Install the plugin**
   ```bash
   pnpm add -D astro-nx
   ```

2. **Update project.json**
   ```json
   {
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

3. **Update dependencies**
   ```bash
   pnpm add astro @astrojs/check typescript
   ```

## From Vite + Astro

### Key Changes

- Replace Vite-specific configurations with Astro-native ones
- Update build scripts to use Astro executors
- Migrate Vite plugins to Astro integrations where applicable

### Migration Steps

1. **Install the plugin**
   ```bash
   pnpm add -D astro-nx
   ```

2. **Create new Astro project**
   ```bash
   nx g astro-nx:init my-app --packageManager=pnpm
   ```

3. **Migrate Vite configuration**
   ```javascript
   // Old vite.config.js
   import { defineConfig } from 'vite';
   
   export default defineConfig({
     // vite config
   });
   
   // New astro.config.mjs
   import { defineConfig } from 'astro/config';
   
   export default defineConfig({
     // astro config
   });
   ```

4. **Update build process**
   ```bash
   # Old
   nx build my-app # using Vite
   
   # New
   nx build my-app # using Astro
   ```

## Common Migration Issues

### 1. Import Path Changes

**Issue**: Import paths might need updating
**Solution**: Update relative imports and check for case sensitivity

```javascript
// Before
import Component from './components/MyComponent.astro';

// After (check actual file name)
import Component from './components/MyComponent.astro';
```

### 2. Dependency Conflicts

**Issue**: Conflicting packages between old and new setup
**Solution**: Clean install with pnpm

```bash
rm -rf node_modules package-lock.json yarn.lock pnpm-lock.yaml
pnpm install
```

### 3. Configuration Merging

**Issue**: Existing configurations need to be merged
**Solution**: Carefully review and merge configurations

```javascript
// Merge your existing astro.config.mjs with the generated one
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Your existing config
  integrations: [
    // Your integrations
  ],
  // Generated config will be merged here
});
```

### 4. Build Output Location

**Issue**: Build output might be in a different location
**Solution**: Update deployment scripts

```bash
# Old location
dist/

# New location (if using custom outDir)
dist/my-app/
```

## Verification Checklist

After migration, verify:

- [ ] Development server starts: `nx dev my-app`
- [ ] Build completes: `nx build my-app`
- [ ] Preview works: `nx preview my-app`
- [ ] Type checking passes: `nx check my-app`
- [ ] All routes are accessible
- [ ] Assets load correctly
- [ ] Integrations work as expected
- [ ] Dependencies are correctly installed with pnpm

## Getting Help

If you encounter issues during migration:

1. Check the [Troubleshooting section](./api-reference.md#troubleshooting) in the API reference
2. Review the [Quick Start Guide](./quick-start.md) for basic setup
3. Look at the [example project](../examples/with-pnpm/README.md) for reference
4. File an issue in the project repository

## Post-Migration Best Practices

1. **Update CI/CD**: Ensure your CI/CD pipeline uses pnpm commands
2. **Team Setup**: Document pnpm installation for team members
3. **Scripts**: Update package.json scripts to use `nx` commands
4. **Documentation**: Update project README with new commands
5. **Dependencies**: Regular updates using `pnpm update`
