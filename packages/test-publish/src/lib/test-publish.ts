/**
 * A test function to validate the publishing setup and build process.
 * This function demonstrates various TypeScript features and ensures the build works correctly.
 */
export function testPublish(): string {
  return 'test-publish';
}

/**
 * Configuration interface for testing the publishing process
 */
export interface PublishConfig {
  packageName: string;
  version: string;
  registry?: string;
}

/**
 * Validates the package configuration and returns build information.
 * This function helps verify that the package is correctly configured for publishing.
 * 
 * @param config - The publish configuration
 * @returns An object containing validation results and build information
 */
export function validatePublishSetup(config: PublishConfig) {
  const buildInfo = {
    packageName: config.packageName,
    version: config.version,
    registry: config.registry || 'https://registry.npmjs.org/',
    timestamp: new Date().toISOString(),
    isValid: true,
  };

  // Validate package name format
  if (!config.packageName || !config.packageName.startsWith('@forastro/')) {
    buildInfo.isValid = false;
  }

  // Validate version format (basic semver check)
  const versionPattern = /^\d+\.\d+\.\d+/;
  if (!config.version || !versionPattern.test(config.version)) {
    buildInfo.isValid = false;
  }

  return buildInfo;
}

/**
 * Utility function to demonstrate module exports and TypeScript compilation
 */
export const PACKAGE_INFO = {
  name: '@forastro/test-publish',
  description: 'Test package to validate Nx publishing setup',
  features: ['TypeScript', 'ESM', 'tsup bundling', 'Nx release'],
} as const;
