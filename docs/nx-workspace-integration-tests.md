# Nx Workspace Integration Tests

This document describes the comprehensive test suite for Nx workspace integration in the astro-nx plugin.

## Overview

The `src/generators/nx-workspace-integration.spec.ts` file contains tests that verify proper integration with Nx workspace features including:

1. **Project Configuration**: Validates that `project.json` files are properly created and configured
2. **Workspace Registration**: Ensures projects are correctly registered in the Nx workspace
3. **Executor Configuration**: Verifies that Astro-specific executors are properly configured
4. **Generator Behavior**: Tests that generators don't inadvertently modify workspace configuration
5. **Caching and Dependencies**: Validates proper caching configuration for Astro builds

## Test Categories

### 1. Project Registration and Configuration

These tests verify that:
- Valid `project.json` files are created with proper Astro executors
- Projects are correctly registered in the workspace
- Nx schema references are properly configured
- Target defaults from `nx.json` are inherited correctly

### 2. Generator Workspace Integration

Tests ensure that:
- Component generation doesn't modify `nx.json`
- Page generation preserves workspace configuration
- Content file generation maintains workspace structure
- All generators work within existing Nx projects

### 3. Executor Configuration Validation

Validates that:
- All four Astro executors (`dev`, `build`, `preview`, `check`) are properly defined
- Executor options match their schemas
- Custom configurations are supported
- Default values are applied correctly

### 4. Workspace Layout and Organization

Tests verify:
- Respect for workspace layout configuration (`apps/` and `packages/` directories)
- Consistent project structure across generators
- Proper file organization within Astro projects

### 5. Cache and Dependency Configuration

Ensures:
- Build and check targets are properly cached
- Dev and preview servers are not cached (as they shouldn't be)
- Input and output configurations are correct
- Target defaults from `nx.json` are inherited

## Key Features Tested

### Astro-Nx Executors

The tests validate all four executors:

1. **`@forastro/astro-nx:dev`** - Development server
   - Port and host configuration
   - Auto-open browser option
   - Verbose logging support
   - Custom config file paths

2. **`@forastro/astro-nx:build`** - Production build
   - Output directory configuration
   - Site and base URL settings
   - Build mode (production/development)
   - Sourcemap generation
   - Custom config support

3. **`@forastro/astro-nx:preview`** - Preview server
   - Port and host configuration
   - Auto-open browser option

4. **`@forastro/astro-nx:check`** - TypeScript checking
   - Verbose logging option
   - Proper caching configuration
   - Output directory for check results

### Nx Integration Points

The tests cover integration with key Nx features:

- **Project Configuration**: Proper `project.json` structure and schema validation
- **Target Defaults**: Inheritance of caching, inputs, and dependency configuration
- **Workspace Layout**: Respect for `apps/` and `packages/` directory structure
- **Caching**: Appropriate cache configuration for different target types
- **Tags**: Support for project categorization and filtering

## Running the Tests

```bash
# Run all astro-nx tests
pnpm nx test astro-nx

# Run only workspace integration tests
pnpm nx test astro-nx --testNamePattern="Nx Workspace Integration Tests"
```

## Test Structure

Each test follows a consistent pattern:

1. **Setup**: Create an Nx workspace tree with necessary configuration
2. **Action**: Execute the generator or verify configuration
3. **Assertion**: Validate that workspace integration works correctly

The tests use Nx's testing utilities to create realistic workspace environments and validate proper integration behavior.
