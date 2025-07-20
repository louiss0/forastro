# E2E Testing for Astro Nx Plugin

This directory contains end-to-end tests for the Astro Nx plugin using both Cypress and Nx Plugin testing utilities.

## Setup

The e2e testing setup includes:

1. **Cypress Configuration**: For UI testing of generated Astro applications
2. **Nx Plugin Testing**: For testing the plugin's generators and executors
3. **JPD Integration Tests**: For testing JavaScript Package Delegator functionality

## Test Structure

```
e2e/
├── src/
│   ├── astro-nx.spec.ts           # Plugin generator/executor tests
│   ├── astro-app.cy.ts            # Cypress UI tests
│   ├── jpd-integration.spec.ts    # JPD integration tests
│   └── support/
│       ├── commands.ts            # Custom Cypress commands
│       └── e2e.ts                 # Cypress support file
├── cypress.config.ts              # Cypress configuration
└── project.json                   # Nx project configuration
```

## Running Tests

### Plugin E2E Tests (Using Nx Plugin Testing)

```bash
# Run all e2e tests
pnpm test:e2e

# Run e2e tests in watch mode
pnpm test:e2e:watch

# Run specific test file
npx vitest run e2e/src/astro-nx.spec.ts --config vitest.e2e.config.ts
```

### Cypress UI Tests

```bash
# Run Cypress e2e tests
nx e2e

# Run Cypress tests in CI mode
nx e2e-ci
```

## Test Scenarios

### Package Manager Tests

The tests verify that the plugin works correctly with different package managers:

- **pnpm**: Tests backward compatibility by forcing package manager to pnpm
- **npm**: Tests default behavior with npm package manager

### Template Tests

Tests verify that all supported templates work correctly:

- **minimal**: Basic Astro setup
- **vue**: Astro with Vue integration
- **mdx**: Astro with MDX support
- **markdoc**: Astro with Markdoc support
- **preact**: Astro with Preact integration
- **asciidoc**: Astro with Asciidoc support

### Executor Tests

Tests verify that all executors work correctly:

- **build**: Builds the Astro application
- **dev**: Starts the development server
- **preview**: Starts the preview server
- **check**: Runs Astro check command

### JPD Integration Tests

Tests verify JavaScript Package Delegator functionality:

- Creates sample workspace in tmp directory
- Runs generator with different configurations
- Tests build, dev, and preview executors
- Verifies package manager selection works correctly
- Tests backward compatibility scenarios

## Sample Workspace Creation

The JPD integration tests create a sample workspace in a temporary directory to test the plugin functionality:

```typescript
// Create sample workspace in tmp
const workspaceDir = join(tmpDir, 'test-workspace');
mkdirSync(workspaceDir, { recursive: true });

// Initialize Nx workspace
await runCommandAsync('npx create-nx-workspace@latest test-workspace --preset=empty --packageManager=pnpm');

// Test plugin functionality
await runNxCommandAsync('generate @nx/astro-nx:init app-name --packageManager=pnpm --template=minimal');
```

## Cypress UI Tests

The Cypress tests verify the generated Astro applications work correctly:

- **Home Page**: Verifies the application loads correctly
- **Meta Tags**: Checks for proper HTML meta tags
- **CSS Loading**: Verifies CSS is loaded properly
- **Responsiveness**: Tests different viewport sizes
- **JavaScript**: Verifies JavaScript functionality
- **Accessibility**: Basic accessibility checks
- **404 Handling**: Tests error page handling

## Configuration

### Cypress Configuration

```typescript
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4321',
    specPattern: 'src/**/*.cy.ts',
    // ... other configuration
  },
});
```

### Vitest E2E Configuration

```typescript
export default defineConfig({
  test: {
    testTimeout: 300000,
    hookTimeout: 300000,
    include: ['e2e/src/**/*.{test,spec}.{js,ts}'],
    // ... other configuration
  },
});
```

## Best Practices

1. **Test Isolation**: Each test creates its own temporary workspace
2. **Cleanup**: Tests clean up temporary files after completion
3. **Timeout Management**: Long timeouts for package installation and building
4. **Error Handling**: Proper error handling for failed commands
5. **Assertion Patterns**: Use consistent assertion patterns across tests

## Troubleshooting

### Common Issues

1. **Test Timeouts**: Increase timeout values in vitest.e2e.config.ts
2. **Package Manager Issues**: Ensure pnpm is installed globally
3. **Port Conflicts**: Tests use different ports for dev/preview servers
4. **Cleanup Issues**: Temporary directories are cleaned up automatically

### Debug Mode

To run tests in debug mode:

```bash
# Run with verbose output
npx vitest run e2e/src/astro-nx.spec.ts --config vitest.e2e.config.ts --reporter=verbose

# Run single test with debug output
npx vitest run e2e/src/astro-nx.spec.ts --config vitest.e2e.config.ts -t "should create astro application with pnpm"
```

## Integration with CI/CD

The e2e tests are designed to work in CI/CD environments:

- Tests create isolated workspaces
- Proper cleanup prevents resource leaks
- Tests can run in parallel with proper isolation
- Configuration supports both local and CI environments
