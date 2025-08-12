import { buildArgs } from './args';

describe('buildArgs', () => {
  it('should preserve base arguments', () => {
    const result = buildArgs(['dev'], []);
    expect(result).toEqual(['dev']);
  });

  it('should handle boolean flags when true', () => {
    const result = buildArgs(['dev'], [
      ['--open', true],
      ['--verbose', true]
    ]);
    expect(result).toEqual(['dev', '--open', '--verbose']);
  });

  it('should skip boolean flags when false or undefined', () => {
    const result = buildArgs(['dev'], [
      ['--open', false],
      ['--verbose', undefined],
      ['--draft', true]
    ]);
    expect(result).toEqual(['dev', '--draft']);
  });

  it('should handle string flags when defined', () => {
    const result = buildArgs(['build'], [
      ['--config', 'astro.config.mjs'],
      ['--outDir', 'dist']
    ]);
    expect(result).toEqual(['build', '--config', 'astro.config.mjs', '--outDir', 'dist']);
  });

  it('should skip string flags when undefined', () => {
    const result = buildArgs(['build'], [
      ['--config', 'astro.config.mjs'],
      ['--outDir', undefined],
      ['--base', '']
    ]);
    expect(result).toEqual(['build', '--config', 'astro.config.mjs', '--base', '']);
  });

  it('should handle number flags when defined', () => {
    const result = buildArgs(['dev'], [
      ['--port', 4321],
      ['--timeout', 30000]
    ]);
    expect(result).toEqual(['dev', '--port', '4321', '--timeout', '30000']);
  });

  it('should skip number flags when undefined', () => {
    const result = buildArgs(['dev'], [
      ['--port', 4321],
      ['--timeout', undefined]
    ]);
    expect(result).toEqual(['dev', '--port', '4321']);
  });

  it('should preserve insertion order', () => {
    const result = buildArgs(['build'], [
      ['--config', 'config.mjs'],
      ['--verbose', true],
      ['--outDir', 'dist'],
      ['--open', false],  // Should be skipped
      ['--port', 3000],
      ['--draft', true]
    ]);
    expect(result).toEqual([
      'build',
      '--config', 'config.mjs',
      '--verbose',
      '--outDir', 'dist',
      '--port', '3000',
      '--draft'
    ]);
  });

  it('should handle mixed types correctly', () => {
    const result = buildArgs(['check'], [
      ['--typescript', true],
      ['--config', 'tsconfig.json'],
      ['--watch', false],
      ['--threads', 4],
      ['--format', undefined]
    ]);
    expect(result).toEqual([
      'check',
      '--typescript',
      '--config', 'tsconfig.json',
      '--threads', '4'
    ]);
  });

  it('should handle null values by skipping them', () => {
    const result = buildArgs(['dev'], [
      ['--port', 3000],
      ['--host', null as any], // Type assertion for testing
      ['--open', true]
    ]);
    expect(result).toEqual(['dev', '--port', '3000', '--open']);
  });

  it('should convert numbers to strings correctly', () => {
    const result = buildArgs(['preview'], [
      ['--port', 0], // Edge case: zero should be converted to '0'
      ['--timeout', 5000]
    ]);
    expect(result).toEqual(['preview', '--port', '0', '--timeout', '5000']);
  });
});
