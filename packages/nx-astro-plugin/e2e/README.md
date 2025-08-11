# E2E Smoke Tests for Astro NX Generator

This directory contains comprehensive end-to-end (E2E) smoke tests for the Astro NX generator that verify the core functionality of project creation using ForAstro templates.

## Test Coverage

### ✅ Core Functionality Verified

- **Project Configuration**: Confirms that NX project configurations are created with correct targets (`dev`, `build`, `preview`, `check`)
- **Template File Copying**: Verifies that template files are properly copied from the templates directory
- **File Exclusion**: Ensures build artifacts (`node_modules`, `dist`, `.astro`) are excluded during copying
- **Skip Install Behavior**: Tests that the `skipInstall` option properly prevents package installation
- **Directory Structure**: Validates that `src/` and `public/` directories are copied correctly
- **Template Variants**: Tests multiple templates including `astro-minimal`, `astro-mdx`, and `astro-preact`
- **Error Handling**: Verifies proper error messages for invalid templates
- **Project Naming**: Tests handling of project names with special characters

### 🔧 Architecture

The tests use:
- **Vitest** for the testing framework (ESM-friendly as requested)
- **Temporary Workspaces**: Creates isolated test environments for each test
- **Real Templates**: Copies actual template files from the monorepo for authentic testing
- **NX DevKit Testing Utilities**: Uses `@nx/devkit/testing` for workspace simulation

### 📁 File Structure

```
e2e/
├── src/
│   ├── test-utils.ts          # Reusable test utilities and helpers
│   └── init-generator.spec.ts # Main E2E test suite
└── README.md                  # This documentation
```

## Running the Tests

```bash
# From the nx-astro-plugin directory
pnpm test

# Or run with the custom script
node run-e2e-tests.mjs
```

## Test Configuration

The tests are configured with:
- **Environment**: Node.js (appropriate for NX generators)
- **Timeout**: 120 seconds (adequate for file operations and template copying)
- **Globals**: Enabled for cleaner test syntax
- **Coverage**: V8 provider with reports in `../../coverage/packages/nx-astro-plugin`

## Key Test Scenarios

1. **Basic Project Creation**: Creates a project with minimal template and verifies structure
2. **Custom Directory**: Tests the `directory` parameter for non-default project locations  
3. **Tag Handling**: Verifies parsing and assignment of project tags
4. **Template-Specific Files**: Validates that template-specific files (MDX, TSX) are copied correctly
5. **Integration Workflow**: End-to-end test covering the complete project creation process

## Test Utilities

The `test-utils.ts` module provides:
- `createTestWorkspace()`: Sets up temporary isolated test environments
- `assertProjectConfiguration()`: Validates NX project configurations
- `assertTemplateFilesCopied()`: Verifies file copying operations
- `assertExcludedFiles()`: Ensures unwanted files are not copied
- `AVAILABLE_TEMPLATES`: Constants for supported templates

## Future Enhancements

While the core generator functionality is thoroughly tested, future iterations could address:
- Synchronization between NX tree API and file system operations
- Additional template validation
- Package manager selection testing with actual package managers

## ESM Compatibility

As requested, these tests use Vitest which provides excellent ESM support, enabling:
- Modern `import`/`export` syntax throughout
- Direct testing of ESM modules
- Native TypeScript support without transpilation overhead
