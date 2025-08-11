import { testPublish, validatePublishSetup, PACKAGE_INFO, type PublishConfig } from './test-publish';

describe('testPublish', () => {
  it('should return the package identifier', () => {
    expect(testPublish()).toEqual('test-publish');
  });
});

describe('validatePublishSetup', () => {
  it('should validate a correct forastro package configuration', () => {
    const config: PublishConfig = {
      packageName: '@forastro/test-publish',
      version: '1.0.0',
      registry: 'https://registry.npmjs.org/'
    };

    const result = validatePublishSetup(config);
    
    expect(result.isValid).toBe(true);
    expect(result.packageName).toBe('@forastro/test-publish');
    expect(result.version).toBe('1.0.0');
    expect(result.registry).toBe('https://registry.npmjs.org/');
    expect(result.timestamp).toBeDefined();
  });

  it('should invalidate incorrect package name', () => {
    const config: PublishConfig = {
      packageName: 'invalid-package-name',
      version: '1.0.0'
    };

    const result = validatePublishSetup(config);
    expect(result.isValid).toBe(false);
  });

  it('should invalidate incorrect version format', () => {
    const config: PublishConfig = {
      packageName: '@forastro/test-publish',
      version: 'invalid-version'
    };

    const result = validatePublishSetup(config);
    expect(result.isValid).toBe(false);
  });

  it('should use default registry when not provided', () => {
    const config: PublishConfig = {
      packageName: '@forastro/test-publish',
      version: '1.0.0'
    };

    const result = validatePublishSetup(config);
    expect(result.registry).toBe('https://registry.npmjs.org/');
  });
});

describe('PACKAGE_INFO', () => {
  it('should contain correct package information', () => {
    expect(PACKAGE_INFO.name).toBe('@forastro/test-publish');
    expect(PACKAGE_INFO.description).toBe('Test package to validate Nx publishing setup');
    expect(PACKAGE_INFO.features).toEqual(['TypeScript', 'ESM', 'tsup bundling', 'Nx release']);
  });
});
