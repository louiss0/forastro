import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Tree, ProjectConfiguration } from '@nx/devkit';
import generator from './generator.js';
import * as devkit from '@nx/devkit';
import * as astroUtils from '../../utils/astro.js';

vi.mock('@nx/devkit', async () => {
  const actual = await vi.importActual<typeof devkit>('@nx/devkit');
  return {
    ...actual,
    readProjectConfiguration: vi.fn(),
    joinPathFragments: actual.joinPathFragments,
    formatFiles: vi.fn(),
  };
});

vi.mock('../../utils/astro.js', () => ({
  detectIntegrations: vi.fn(),
}));

describe('component generator', () => {
  let tree: Tree;
  const mockReadProjectConfiguration = vi.mocked(devkit.readProjectConfiguration);
  const mockFormatFiles = vi.mocked(devkit.formatFiles);
  const mockDetectIntegrations = vi.mocked(astroUtils.detectIntegrations);
  const writeSpy = vi.fn<[string, string], void>();

  beforeEach(() => {
    writeSpy.mockReset();
    mockDetectIntegrations.mockReset();
    tree = {
      root: '/workspace',
      exists: vi.fn<[string], boolean>().mockReturnValue(false) as unknown as Tree['exists'],
      write: writeSpy as unknown as Tree['write'],
      read: vi.fn<[string, string?], string | null>() as unknown as Tree['read'],
    } as unknown as Tree;

    mockReadProjectConfiguration.mockReturnValue({
      root: 'apps/site',
      name: 'site',
    } as unknown as ProjectConfiguration);
  });

  describe('server components', () => {
    it('creates a server component in src/components with PascalCase name (default)', async () => {
      mockDetectIntegrations.mockReturnValue([]);
      await generator(tree, { project: 'site', name: 'my button' });

      const call = writeSpy.mock.calls[0];
      const path = call[0].replace(/\\/g, '/');
      const content = call[1];
      expect(path).toContain('apps/site/src/components/MyButton.astro');
      expect(content).toContain('export interface Props');
      expect(content).toContain('title = \'MyButton\'');
      expect(mockFormatFiles).toHaveBeenCalled();
    });

    it('creates a server component explicitly', async () => {
      mockDetectIntegrations.mockReturnValue([]);
      await generator(tree, { project: 'site', name: 'Button', type: 'server' });

      const call = writeSpy.mock.calls[0];
      const path = call[0].replace(/\\/g, '/');
      const content = call[1];
      expect(path).toContain('apps/site/src/components/Button.astro');
      expect(content).toContain('export interface Props');
    });

    it('supports directory option under src/components', async () => {
      mockDetectIntegrations.mockReturnValue([]);
      await generator(tree, { project: 'site', name: 'modal', directory: 'ui' });

      const call = writeSpy.mock.calls[0];
      const path = call[0].replace(/\\/g, '/');
      expect(path).toContain('apps/site/src/components/ui/Modal.astro');
    });

    it('supports nested directory paths', async () => {
      mockDetectIntegrations.mockReturnValue([]);
      await generator(tree, { project: 'site', name: 'card', directory: 'ui/widgets' });

      const call = writeSpy.mock.calls[0];
      const path = call[0].replace(/\\/g, '/');
      expect(path).toContain('apps/site/src/components/ui/widgets/Card.astro');
    });

    it('handles Windows-style directory paths', async () => {
      mockDetectIntegrations.mockReturnValue([]);
      await generator(tree, { project: 'site', name: 'header', directory: 'layout\\navigation' });

      const call = writeSpy.mock.calls[0];
      const path = call[0].replace(/\\/g, '/');
      expect(path).toContain('apps/site/src/components/layout/navigation/Header.astro');
    });
  });

  describe('client components', () => {
    it('auto-selects single installed framework', async () => {
      mockDetectIntegrations.mockReturnValue(['react']);
      await generator(tree, { project: 'site', name: 'Button', type: 'client' });

      const call = writeSpy.mock.calls[0];
      const path = call[0].replace(/\\/g, '/');
      const content = call[1];
      expect(path).toContain('apps/site/src/components/Button.tsx');
      expect(content).toContain('import { useState, useEffect } from \'react\'');
      expect(content).toContain('export function Button');
    });

    it('uses specified framework even if only one installed', async () => {
      mockDetectIntegrations.mockReturnValue(['react']);
      await generator(tree, { project: 'site', name: 'Button', type: 'client', framework: 'react' });

      const call = writeSpy.mock.calls[0];
      const path = call[0].replace(/\\/g, '/');
      expect(path).toContain('apps/site/src/components/Button.tsx');
    });

    it('throws error if no frameworks are installed', async () => {
      mockDetectIntegrations.mockReturnValue([]);
      await expect(
        generator(tree, { project: 'site', name: 'Button', type: 'client' })
      ).rejects.toThrow('No client framework integrations found');
    });

    it('throws error if multiple frameworks installed without explicit choice', async () => {
      mockDetectIntegrations.mockReturnValue(['react', 'vue', 'svelte']);
      await expect(
        generator(tree, { project: 'site', name: 'Button', type: 'client' })
      ).rejects.toThrow('Multiple frameworks installed');
    });

    it('throws error if specified framework is not installed', async () => {
      mockDetectIntegrations.mockReturnValue(['react']);
      await expect(
        generator(tree, { project: 'site', name: 'Button', type: 'client', framework: 'vue' })
      ).rejects.toThrow("Framework 'vue' is not installed");
    });

    it('generates React component with hooks', async () => {
      mockDetectIntegrations.mockReturnValue(['react']);
      await generator(tree, { project: 'site', name: 'Counter', type: 'client', framework: 'react' });

      const content = writeSpy.mock.calls[0][1];
      expect(content).toContain('import { useState, useEffect } from \'react\'');
      expect(content).toContain('const [count, setCount] = useState(0)');
      expect(content).toContain('export function Counter');
    });

    it('generates Preact component with signals', async () => {
      mockDetectIntegrations.mockReturnValue(['preact']);
      await generator(tree, { project: 'site', name: 'Counter', type: 'client', framework: 'preact' });

      const content = writeSpy.mock.calls[0][1];
      expect(content).toContain('import { signal, computed, effect } from \'@preact/signals\'');
      expect(content).toContain('const count = signal(0)');
      expect(content).toContain('const doubled = computed');
    });

    it('generates Vue component with refs', async () => {
      mockDetectIntegrations.mockReturnValue(['vue']);
      await generator(tree, { project: 'site', name: 'Counter', type: 'client', framework: 'vue' });

      const call = writeSpy.mock.calls[0];
      const path = call[0].replace(/\\/g, '/');
      const content = call[1];
      expect(path).toContain('apps/site/src/components/Counter.vue');
      expect(content).toContain('<script setup lang="ts">');
      expect(content).toContain('import { ref, computed, onMounted } from \'vue\'');
      expect(content).toContain('const count = ref(0)');
    });

    it('generates Svelte component with runes', async () => {
      mockDetectIntegrations.mockReturnValue(['svelte']);
      await generator(tree, { project: 'site', name: 'Counter', type: 'client', framework: 'svelte' });

      const call = writeSpy.mock.calls[0];
      const path = call[0].replace(/\\/g, '/');
      const content = call[1];
      expect(path).toContain('apps/site/src/components/Counter.svelte');
      expect(content).toContain('let count = $state(0)');
      expect(content).toContain('let doubled = $derived(count * 2)');
      expect(content).toContain('$effect(() =>');
    });

    it('generates Angular component with signals', async () => {
      mockDetectIntegrations.mockReturnValue(['angular']);
      await generator(tree, { project: 'site', name: 'Counter', type: 'client', framework: 'angular' });

      const call = writeSpy.mock.calls[0];
      const path = call[0].replace(/\\/g, '/');
      const content = call[1];
      expect(path).toContain('apps/site/src/components/Counter.ts');
      expect(content).toContain('import { Component, Input, signal, computed, effect } from \'@angular/core\'');
      expect(content).toContain('export class CounterComponent');
      expect(content).toContain('count = signal(0)');
      expect(content).toContain('doubled = computed(() => this.count() * 2)');
    });

    it('generates client components in nested directories', async () => {
      mockDetectIntegrations.mockReturnValue(['react']);
      await generator(tree, { project: 'site', name: 'Button', type: 'client', framework: 'react', directory: 'ui/buttons' });

      const call = writeSpy.mock.calls[0];
      const path = call[0].replace(/\\/g, '/');
      expect(path).toContain('apps/site/src/components/ui/buttons/Button.tsx');
    });
  });

  describe('component content', () => {
    it('server components include TypeScript Props interface', async () => {
      mockDetectIntegrations.mockReturnValue([]);
      await generator(tree, { project: 'site', name: 'Card', type: 'server' });

      const content = writeSpy.mock.calls[0][1];
      expect(content).toContain('export interface Props');
      expect(content).toContain('title?: string');
      expect(content).toContain('Astro.props');
    });

    it('React components include TypeScript Props interface', async () => {
      mockDetectIntegrations.mockReturnValue(['react']);
      await generator(tree, { project: 'site', name: 'Button', type: 'client', framework: 'react' });

      const content = writeSpy.mock.calls[0][1];
      expect(content).toContain('export interface ButtonProps');
      expect(content).toContain('title?: string');
    });

    it('Preact components include TypeScript Props interface', async () => {
      mockDetectIntegrations.mockReturnValue(['preact']);
      await generator(tree, { project: 'site', name: 'Widget', type: 'client', framework: 'preact' });

      const content = writeSpy.mock.calls[0][1];
      expect(content).toContain('export interface WidgetProps');
      expect(content).toContain('title?: string');
    });

    it('Vue components include TypeScript Props interface', async () => {
      mockDetectIntegrations.mockReturnValue(['vue']);
      await generator(tree, { project: 'site', name: 'Panel', type: 'client', framework: 'vue' });

      const content = writeSpy.mock.calls[0][1];
      expect(content).toContain('interface Props');
      expect(content).toContain('title?: string');
      expect(content).toContain('defineProps<Props>');
    });

    it('Svelte components include TypeScript Props interface', async () => {
      mockDetectIntegrations.mockReturnValue(['svelte']);
      await generator(tree, { project: 'site', name: 'Box', type: 'client', framework: 'svelte' });

      const content = writeSpy.mock.calls[0][1];
      expect(content).toContain('interface Props');
      expect(content).toContain('title?: string');
      expect(content).toContain('$props()');
    });
  });
});
