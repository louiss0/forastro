# Contributing to @forastro/nx-astro-plugin

Thank you for your interest in contributing to the Nx Astro Plugin! This guide will help you get started with development, testing, and submitting changes.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Project Structure](#project-structure)
4. [Testing Guidelines](#testing-guidelines)
5. [Adding New Features](#adding-new-features)
6. [Code Style](#code-style)
7. [Pull Request Process](#pull-request-process)
8. [Local Testing](#local-testing)

## Getting Started

### Prerequisites

- **Node.js**: Version 18 or 20 (LTS recommended)
- **Package Manager**: pnpm (preferred) or npm
- **Git**: For version control
- **git-flow**: CLI tool for Git Flow workflow (optional but recommended)

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/forastro.git
   cd forastro
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Verify Nx is available:**
   ```bash
   pnpm dlx nx --version
   ```

4. **Run baseline tests:**
   ```bash
   pnpm nx test nx-astro-plugin --coverage
   ```

5. **Build the plugin:**
   ```bash
   pnpm nx build nx-astro-plugin
   ```

### Editor Setup (Optional)

For the best development experience, we recommend:
- **Micro** editor with plugins: lsp, wakatime, detectindent, fzf, jump
- **VS Code** with TypeScript, Prettier, and ESLint extensions
- **Theme preferences**: Nord or Dracula

## Development Workflow

This project follows a **CI-centric Git Flow** workflow with continuous integration.

### Creating a Feature Branch

```bash
# Using git-flow (recommended)
git flow feature start my-feature-name

# Or manually
git checkout -b feature/my-feature-name develop
```

### Commit Message Format

We follow the **Conventional Commits** specification:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Type** must be one of:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style/formatting (no behavior change)
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD configuration
- `chore`: Maintenance tasks

**Scope** should be `nx-astro-plugin` for this package.

**Subject** must be:
- Written in imperative mood (e.g., "add", "fix", "update")
- Maximum 64 characters
- No trailing period

**Examples:**
```bash
feat(nx-astro-plugin): add Starlight docs generator
fix(nx-astro-plugin): handle Windows paths correctly
test(nx-astro-plugin): add cross-platform path tests
docs(nx-astro-plugin): update README with new options
```

### Testing Requirements

Before committing, ensure:
1. All tests pass: `pnpm nx test nx-astro-plugin`
2. Linting passes: `pnpm nx lint nx-astro-plugin`
3. Build succeeds: `pnpm nx build nx-astro-plugin`
4. Coverage is maintained or improved

### Code Formatting

- **Indentation**: Spaces (consistent with the codebase)
- **Line length**: Maximum 96 characters
- **Use formatters**: Prettier is configured; run `pnpm format` if available
- **Automated**: The codebase uses consistent formatting enforced by tooling

## Project Structure

### Package Layout

```
packages/nx-astro-plugin/
├── src/
│   ├── executors/          # Nx executors (tasks that run commands)
│   │   ├── build/
│   │   ├── dev/
│   │   ├── preview/
│   │   ├── check/
│   │   ├── sync/
│   │   └── add/
│   ├── generators/         # Nx generators (code scaffolding)
│   │   ├── app/
│   │   ├── component/
│   │   ├── page/
│   │   ├── layout/
│   │   ├── content/
│   │   ├── collection-schema/
│   │   ├── starlight-docs/
│   │   ├── init/
│   │   └── add-integration/
│   └── utils/              # Shared utilities
│       ├── astro.ts        # Astro config detection/parsing
│       ├── exec.ts         # Command execution helpers
│       ├── pm.ts           # Package manager utilities
│       └── naming.ts       # Naming conventions
├── executors.json          # Executor registry
├── generators.json         # Generator registry
├── package.json
└── README.md
```

### Executors vs. Generators

**Executors** run tasks/commands:
- Located in `src/executors/<name>/`
- Each has: `executor.ts`, `schema.json`, `schema.d.ts`
- Examples: `build`, `dev`, `preview`, `check`, `sync`
- Purpose: Wrap Astro CLI commands with Nx integration

**Generators** scaffold code:
- Located in `src/generators/<name>/`
- Each has: `generator.ts`, `schema.json`, `schema.d.ts`, `files/` (optional)
- Examples: `app`, `component`, `page`, `content`
- Purpose: Generate Astro projects, components, pages, etc.

### Utility Modules

**`utils/astro.ts`**
- Detect Astro config files
- Parse integration configurations
- Validate Astro project structure

**`utils/exec.ts`**
- Execute shell commands safely
- Handle command output and errors
- Provide both throwing (`run`) and safe (`tryRun`) variants

**`utils/pm.ts`**
- Detect package manager (pnpm, npm, yarn)
- Resolve Astro binary location
- Check for ESLint and other tooling

**`utils/naming.ts`**
- Convert names to different cases (kebab, pascal, camel)
- Normalize file names and identifiers
- Validate naming conventions

## Testing Guidelines

### Test Organization

- **Location**: Tests are co-located with source files as `*.spec.ts`
- **Framework**: Vitest
- **Coverage target**: Maintain or exceed 90% (currently 97.93%)

### Running Tests

```bash
# Run all tests
pnpm nx test nx-astro-plugin

# Run tests with coverage
pnpm nx test nx-astro-plugin --coverage

# Run specific test file
pnpm nx test nx-astro-plugin --testPathPattern=generator.spec.ts

# Watch mode for development
pnpm nx test nx-astro-plugin --watch
```

### Test Structure

Follow this pattern for test files:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import type { Tree } from '@nx/devkit';

describe('my-generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    // Setup common state
  });

  it('should create expected files', async () => {
    await myGenerator(tree, { project: 'test-app' });
    
    expect(tree.exists('apps/test-app/src/index.astro')).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    // Test error conditions
  });
});
```

### Mocking Strategy

**For executors:**
```typescript
vi.mock('execa');
vi.mock('../../utils/pm.js', () => ({
  resolveAstroBinary: vi.fn(),
}));
```

**For generators:**
```typescript
vi.mock('../../utils/astro.js', () => ({
  detectIntegrations: vi.fn(),
}));
```

### Test Naming Conventions

- Use descriptive test names starting with "should"
- Group related tests in `describe` blocks
- Test both success and failure paths
- Include edge cases and boundary conditions

### Coverage Requirements

**New code should aim for:**
- Statements: 100%
- Branches: 90%+
- Functions: 100%
- Lines: 100%

**Focus coverage on:**
- All public APIs
- Error handling paths
- Edge cases and boundary conditions
- Cross-platform compatibility (especially paths)

## Adding New Features

### Adding a New Generator

1. **Create generator structure:**
   ```bash
   mkdir -p src/generators/my-feature
   cd src/generators/my-feature
   ```

2. **Create required files:**
   - `generator.ts` - Main generator logic
   - `schema.json` - Options schema with validation
   - `schema.d.ts` - TypeScript types for schema
   - `files/` - Template files (optional)

3. **Implement the generator:**
   ```typescript
   import { Tree, formatFiles, generateFiles, joinPathFragments } from '@nx/devkit';
   import type { MyFeatureSchema } from './schema';

   /**
    * Generates my feature within an Astro project.
    *
    * @param tree - Nx virtual filesystem
    * @param options - Generator options
    * @returns Promise that resolves when complete
    *
    * @example
    * nx g @forastro/nx-astro-plugin:my-feature --project=my-app
    */
   export default async function myFeatureGenerator(
     tree: Tree,
     options: MyFeatureSchema
   ) {
     // Validate inputs
     // Create files
     // Format files
     await formatFiles(tree);
   }
   ```

4. **Define the schema (`schema.json`):**
   ```json
   {
     "$schema": "http://json-schema.org/schema",
     "type": "object",
     "properties": {
       "project": {
         "type": "string",
         "description": "The name of the project",
         "$default": { "$source": "projectName" },
         "x-prompt": "What is the name of the project?"
       }
     },
     "required": ["project"]
   }
   ```

5. **Register in `generators.json`:**
   ```json
   {
     "my-feature": {
       "factory": "./src/generators/my-feature/generator",
       "schema": "./src/generators/my-feature/schema.json",
       "description": "Generate my feature"
     }
   }
   ```

6. **Write comprehensive tests:**
   ```typescript
   describe('my-feature generator', () => {
     it('should create expected files', async () => { });
     it('should handle existing files gracefully', async () => { });
     it('should validate required options', async () => { });
   });
   ```

7. **Add JSDoc documentation** with:
   - Description of what the generator does
   - `@param` tags for all parameters
   - `@returns` tag
   - At least one `@example` showing usage

### Adding a New Executor

1. **Create executor structure:**
   ```bash
   mkdir -p src/executors/my-command
   cd src/executors/my-command
   ```

2. **Create required files:**
   - `executor.ts` - Main executor logic
   - `schema.json` - Options schema
   - `schema.d.ts` - TypeScript types

3. **Implement the executor:**
   ```typescript
   import type { ExecutorContext } from '@nx/devkit';
   import { execa } from 'execa';
   import { join } from 'node:path';

   interface MyCommandOptions {
     // Define options
   }

   /**
    * Executes my Astro command for a project.
    *
    * @param options - Executor options
    * @param context - Nx executor context
    * @returns Promise with success status
    *
    * @example
    * nx run my-app:my-command
    */
   export default async function runExecutor(
     options: MyCommandOptions,
     context: ExecutorContext
   ) {
     // Resolve project directory
     // Build command arguments
     // Execute command
     // Return success/failure
     return { success: true };
   }
   ```

4. **Register in `executors.json`:**
   ```json
   {
     "my-command": {
       "implementation": "./src/executors/my-command/executor",
       "schema": "./src/executors/my-command/schema.json",
       "description": "Run my Astro command"
     }
   }
   ```

5. **Write tests** covering:
   - Default options
   - Custom options
   - Binary resolution
   - Error handling

### Schema Validation Rules

**For enums, use:**
```json
{
  "style": {
    "type": "string",
    "enum": ["css", "scss", "sass", "less"],
    "default": "css"
  }
}
```

**For prompts, use:**
```json
{
  "project": {
    "type": "string",
    "x-prompt": "What is the name of the project?"
  }
}
```

**For interactive prompts:**
```json
{
  "includeExamples": {
    "type": "boolean",
    "default": false,
    "x-prompt": {
      "message": "Would you like to include example files?",
      "type": "confirmation"
    }
  }
}
```

## Code Style

### Philosophy

This project follows a **clarity-first** coding philosophy inspired by Go conventions:

1. **Readability over cleverness** - Code should be straightforward
2. **Self-documenting** - Use descriptive names; comments explain *why*
3. **Consistent patterns** - Follow established patterns in the codebase
4. **Error as values** - Return errors explicitly; avoid throwing for control flow

### TypeScript Guidelines

**Strict mode:**
- Use `strict: true` in tsconfig
- Avoid `any`; prefer `unknown` for truly dynamic types
- Use explicit return types for public APIs

**Imports:**
- Group imports: Node.js built-ins → External packages → Internal modules
- Use type imports: `import type { Type } from 'module'`
- Prefer named exports over default exports (except for generators/executors)

**Naming conventions:**
- **Functions**: `camelCase`, action-oriented (e.g., `createComponent`, `validateProject`)
- **Classes/Interfaces**: `PascalCase` (e.g., `GeneratorSchema`, `ExecutorOptions`)
- **Constants**: `SCREAMING_SNAKE_CASE` for true constants, `camelCase` for config objects
- **Files**: `kebab-case.ts` for most files, `PascalCase.tsx` for React components

### Error Handling

**Prefer explicit returns:**
```typescript
// Good
const result = await tryRun(command, args);
if (!result.success) {
  console.error(result.stderr);
  return { success: false };
}

// Avoid
try {
  await run(command, args);
} catch (err) {
  // ...
}
```

**Provide actionable error messages:**
```typescript
throw new Error(
  `Starlight integration not found. Install it with:\n` +
  `  pnpm add -D @astrojs/starlight\n` +
  `Then add it to your astro.config.mjs integrations array.`
);
```

### Cross-Platform Path Handling

**Always use path utilities:**
```typescript
// Good - cross-platform
import { joinPathFragments } from '@nx/devkit';
const filePath = joinPathFragments(sourceRoot, 'components', 'Button.astro');

// Good - for executors
import { join } from 'node:path';
const cwd = join(context.root, projectRoot);

// Avoid - platform-specific
const filePath = `${sourceRoot}/components/Button.astro`;
```

**Normalize paths in tests:**
```typescript
// When testing on Windows
const normalized = filePath.replace(/\\/g, '/');
expect(normalized).toBe('apps/my-site/src/components/Button.astro');
```

### JSDoc Documentation

**All public APIs must have:**
```typescript
/**
 * Brief description of what the function does.
 *
 * More detailed explanation if needed, including:
 * - Important behavior notes
 * - Side effects
 * - Error conditions
 *
 * @param tree - Nx virtual filesystem
 * @param options - Configuration options
 * @param options.project - Name of the target project
 * @param options.includeExamples - Whether to include example files
 * @returns Promise that resolves when generation is complete
 * @throws {Error} When the project is not found
 *
 * @example
 * await myGenerator(tree, {
 *   project: 'my-app',
 *   includeExamples: true
 * });
 *
 * @example
 * // Via CLI
 * nx g @forastro/nx-astro-plugin:my-generator --project=my-app
 */
```

**Key requirements:**
- Start with a concise summary
- Document all parameters with `@param`
- Include `@returns` describing the return value
- Add `@throws` for known error conditions
- Provide at least one `@example` showing usage
- For executors, include both programmatic and CLI examples

## Pull Request Process

### Pre-PR Checklist

Before opening a pull request, ensure:

- [ ] All tests pass locally
- [ ] Test coverage is maintained or improved
- [ ] Linting passes with no errors
- [ ] Build succeeds without warnings
- [ ] All new code has JSDoc documentation
- [ ] README.md is updated if user-facing changes were made
- [ ] Commit messages follow Conventional Commits format
- [ ] Feature branch is up-to-date with `develop`

### Opening a Pull Request

1. **Push your feature branch:**
   ```bash
   git push origin feature/my-feature-name
   ```

2. **Create PR targeting `develop` branch**

3. **Fill out PR template with:**
   - Clear description of changes
   - Link to related issue(s)
   - Screenshots/examples if applicable
   - Testing instructions
   - Breaking changes (if any)

4. **PR title format:**
   ```
   feat(nx-astro-plugin): add new feature
   ```

### Review Process

- PRs require at least one approval
- Address all review comments
- Keep PRs focused and atomic (one feature/fix per PR)
- Respond to feedback promptly
- Update PR description if scope changes

### After Merge

- Delete feature branch
- Verify CI passes on `develop`
- Monitor for any integration issues

## Local Testing

### Building Locally

```bash
# Build the plugin
pnpm nx build nx-astro-plugin

# Pack for local installation
cd dist/packages/nx-astro-plugin
npm pack
```

### Testing in a Local Workspace

1. **Create a test workspace:**
   ```bash
   npx create-nx-workspace@latest test-workspace
   cd test-workspace
   ```

2. **Install your local plugin:**
   ```bash
   pnpm add -D /path/to/forastro/dist/packages/nx-astro-plugin/forastro-nx-astro-plugin-*.tgz
   ```

3. **Test generators:**
   ```bash
   pnpm nx g @forastro/nx-astro-plugin:app my-test-app
   pnpm nx g @forastro/nx-astro-plugin:component MyComponent --project=my-test-app
   ```

4. **Test executors:**
   ```bash
   pnpm nx run my-test-app:dev
   pnpm nx run my-test-app:build
   pnpm nx run my-test-app:preview
   ```

### Debugging Tips

**Enable verbose logging:**
```bash
NX_VERBOSE_LOGGING=true pnpm nx run my-app:build
```

**Debug with Node inspector:**
```bash
node --inspect-brk node_modules/.bin/nx run my-app:build
```

**Check generated files:**
```typescript
// In tests, inspect the tree
console.log(tree.listChanges());
tree.listChanges().forEach(change => {
  console.log(change.path, change.type);
  if (change.type === 'CREATE') {
    console.log(tree.read(change.path, 'utf-8'));
  }
});
```

**Mock debugging:**
```typescript
// Log mock calls
const mockFn = vi.fn();
mockFn.mockImplementation((...args) => {
  console.log('Called with:', args);
  return someValue;
});
```

## Additional Resources

- [Nx Documentation](https://nx.dev)
- [Astro Documentation](https://docs.astro.build)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## Questions or Issues?

- Open an issue on GitHub
- Join our community discussions
- Check existing issues and PRs for similar topics

Thank you for contributing! 🚀
