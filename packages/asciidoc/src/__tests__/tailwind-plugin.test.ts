import { describe, it, expect, vi } from 'vitest';

// Mock the plugin creation function
const mockPluginHandler = vi.fn();
vi.mock('tailwindcss/plugin', () => ({
  default: vi.fn(() => ({ pluginCreated: true }))
}));

// Mock colors
vi.mock('tailwindcss/colors', () => ({
  default: {
    slate: { 50: '#f8fafc', 900: '#0f172a' },
    zinc: { 50: '#fafafa', 900: '#18181b' },
    neutral: { 50: '#fafafa', 900: '#171717' },
    gray: { 50: '#f9fafb', 900: '#111827' },
    stone: { 50: '#fafaf9', 900: '#1c1917' }
  }
}));

import plugin from 'tailwindcss/plugin';
import { tailwindAsciidocTypography } from '../lib/tailwind';

describe('Tailwind AsciiDoc Typography Plugin Tests', () => {
  const mockPluginFunc = vi.mocked(plugin);

  it('should create a valid Tailwind CSS plugin', () => {
    expect(tailwindAsciidocTypography).toBeDefined();
    expect(typeof tailwindAsciidocTypography).toBe('object');
    expect(tailwindAsciidocTypography).toHaveProperty('pluginCreated', true);
    expect(mockPluginFunc).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should call plugin function with handler', () => {
    const pluginHandler = mockPluginFunc.mock.calls[0]?.[0];
    expect(pluginHandler).toBeInstanceOf(Function);
  });

  it('should execute plugin handler without errors', () => {
    const mockApi = {
      addBase: vi.fn(),
      addComponents: vi.fn(),
      addUtilities: vi.fn(),
      theme: vi.fn(),
    };

    const pluginHandler = mockPluginFunc.mock.calls[0]?.[0];
    expect(() => pluginHandler(mockApi)).not.toThrow();

    // Verify the handler calls the Tailwind API methods
    expect(mockApi.addBase).toHaveBeenCalledTimes(1);
    expect(mockApi.addComponents).toHaveBeenCalledTimes(1);
    expect(mockApi.addUtilities).toHaveBeenCalledTimes(1);
  });

  it('should register base styles including CSS custom properties', () => {
    const mockApi = {
      addBase: vi.fn(),
      addComponents: vi.fn(),
      addUtilities: vi.fn(),
      theme: vi.fn(),
    };

    const pluginHandler = mockPluginFunc.mock.calls[0]?.[0];
    pluginHandler(mockApi);

    const baseStylesCall = mockApi.addBase.mock.calls[0]?.[0];
    expect(baseStylesCall).toBeDefined();
    expect(baseStylesCall).toHaveProperty('@property --faa-prose-color-950');
    expect(baseStylesCall).toHaveProperty('.prose');
    expect(baseStylesCall).toHaveProperty('.prose-invert');
  });

  it('should register component styles as array', () => {
    const mockApi = {
      addBase: vi.fn(),
      addComponents: vi.fn(),
      addUtilities: vi.fn(),
      theme: vi.fn(),
    };

    const pluginHandler = mockPluginFunc.mock.calls[0]?.[0];
    pluginHandler(mockApi);

    const componentsCall = mockApi.addComponents.mock.calls[0]?.[0];
    expect(Array.isArray(componentsCall)).toBe(true);
    expect(componentsCall).toHaveLength(2);
  });

  it('should register utility styles', () => {
    const mockApi = {
      addBase: vi.fn(),
      addComponents: vi.fn(),
      addUtilities: vi.fn(),
      theme: vi.fn(),
    };

    const pluginHandler = mockPluginFunc.mock.calls[0]?.[0];
    pluginHandler(mockApi);

    const utilitiesCall = mockApi.addUtilities.mock.calls[0]?.[0];
    expect(utilitiesCall).toBeDefined();
    expect(typeof utilitiesCall).toBe('object');
  });
});
