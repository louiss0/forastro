import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';

describe('E2E Setup Verification', () => {
  it('should have the correct project structure', () => {
    // Verify the plugin files exist
    expect(existsSync('src/generators/init/generator.ts')).toBe(true);
    expect(existsSync('src/generators/migrate/generator.ts')).toBe(true);
    expect(existsSync('src/executors/build/executor.ts')).toBe(true);
    expect(existsSync('src/executors/dev/executor.ts')).toBe(true);
    expect(existsSync('src/executors/preview/executor.ts')).toBe(true);
    expect(existsSync('src/executors/check/executor.ts')).toBe(true);
  });

  it('should have e2e configuration files', () => {
    expect(existsSync('e2e/cypress.config.ts')).toBe(true);
    expect(existsSync('e2e/project.json')).toBe(true);
    expect(existsSync('e2e/src/support/commands.ts')).toBe(true);
    expect(existsSync('e2e/src/support/e2e.ts')).toBe(true);
  });

  it('should have the correct vitest e2e configuration', () => {
    expect(existsSync('vitest.e2e.config.ts')).toBe(true);
  });

  it('should have built plugin files', () => {
    expect(existsSync('dist/src/generators/init/generator.js')).toBe(true);
    expect(existsSync('dist/src/generators/migrate/generator.js')).toBe(true);
    expect(existsSync('dist/src/executors/build/executor.js')).toBe(true);
    expect(existsSync('dist/src/executors/dev/executor.js')).toBe(true);
    expect(existsSync('dist/src/executors/preview/executor.js')).toBe(true);
    expect(existsSync('dist/src/executors/check/executor.js')).toBe(true);
  });

  it('should have plugin.json available', () => {
    expect(existsSync('plugin.json')).toBe(true);
    expect(existsSync('dist/plugin.json')).toBe(true);
  });

  it('should verify package manager compatibility', () => {
    // Test that we can read package.json
    const packageJson = require('../../package.json');
    expect(packageJson.name).toBe('astro-nx');
    expect(packageJson.dependencies['@nx/devkit']).toBeDefined();
    expect(packageJson.devDependencies['@nx/cypress']).toBeDefined();
  });

  it('should verify template files exist', () => {
    // Check that template files exist for different templates
    expect(existsSync('src/generators/init/files')).toBe(true);
  });

  it('should verify executor schemas exist', () => {
    expect(existsSync('src/executors/build/schema.json')).toBe(true);
    expect(existsSync('src/executors/dev/schema.json')).toBe(true);
    expect(existsSync('src/executors/preview/schema.json')).toBe(true);
    expect(existsSync('src/executors/check/schema.json')).toBe(true);
  });

  it('should verify generator schemas exist', () => {
    expect(existsSync('src/generators/init/schema.json')).toBe(true);
    expect(existsSync('src/generators/migrate/schema.json')).toBe(true);
  });

  it('should verify cypress support files', () => {
    expect(existsSync('e2e/src/astro-app.cy.ts')).toBe(true);
    expect(existsSync('e2e/src/support/commands.ts')).toBe(true);
    expect(existsSync('e2e/src/support/e2e.ts')).toBe(true);
  });
});
