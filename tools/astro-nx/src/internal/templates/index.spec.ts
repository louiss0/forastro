/**
 * Template factory tests
 * 
 * Tests the in-memory template factories to ensure they generate correct content
 * without requiring filesystem access.
 */

import { 
  componentAstroTemplate, 
  pageAstroTemplate, 
  contentTemplateMd, 
  contentTemplateMdx, 
  contentTemplateMarkdoc, 
  contentTemplateAsciidoc,
  astroFileTemplate,
  getTemplateByExtension,
  generateTypeScriptInterface
} from './index.js';

describe('Template Factories', () => {
  describe('componentAstroTemplate', () => {
    it('should generate basic component template with default values', () => {
      const result = componentAstroTemplate();
      
      expect(result).toContain('---');
      expect(result).toContain('export interface Props');
      expect(result).toContain('title?: string');
      expect(result).toContain('class?: string');
      expect(result).toContain('<div class={`component ${className || \'\'}`}>');
      expect(result).toContain('<h2>{title}</h2>');
      expect(result).toContain('<slot />');
      expect(result).toContain('<style>');
      expect(result).toContain('.component {');
    });

    it('should generate component with custom props', () => {
      const result = componentAstroTemplate({
        title: 'MyButton',
        className: 'my-button',
        hasProps: true,
        propsInterface: 'export interface Props {\n  label: string;\n  disabled?: boolean;\n}',
        propsExtraction: 'const { label, disabled = false } = Astro.props;'
      });
      
      expect(result).toContain('export interface Props');
      expect(result).toContain('label: string');
      expect(result).toContain('disabled?: boolean');
      expect(result).toContain('const { label, disabled = false } = Astro.props;');
      expect(result).toContain('<div class={`my-button ${className || \'\'}`}>');
    });

    it('should handle style options correctly', () => {
      const noneResult = componentAstroTemplate({ style: 'none' });
      expect(noneResult).not.toContain('<style>');

      const globalResult = componentAstroTemplate({ style: 'global', className: 'test' });
      expect(globalResult).toContain('<style is:global>');
      expect(globalResult).toContain('.test {');

      const scopedResult = componentAstroTemplate({ style: 'scoped', className: 'test' });
      expect(scopedResult).toContain('<style>');
      expect(scopedResult).toContain('.test {');
    });
  });

  describe('pageAstroTemplate', () => {
    it('should generate basic page template', () => {
      const result = pageAstroTemplate();
      
      expect(result).toContain('---');
      expect(result).toContain('const title = \'Sample Astro Page\'');
      expect(result).toContain('<html lang="en">');
      expect(result).toContain('<title>{title}</title>');
      expect(result).toContain('<h1>{title}</h1>');
      expect(result).toContain('Getting Started');
    });

    it('should generate layout-based page when layout is specified', () => {
      const result = pageAstroTemplate({
        title: 'My Page',
        layout: '../layouts/BaseLayout.astro'
      });
      
      expect(result).toContain('layout: \'../layouts/BaseLayout.astro\'');
      expect(result).toContain('title: \'My Page\'');
      expect(result).toContain('<main>');
      expect(result).toContain('<h1>My Page</h1>');
      expect(result).not.toContain('<html');
    });
  });

  describe('contentTemplateMd', () => {
    it('should generate markdown content with default frontmatter', () => {
      const result = contentTemplateMd();
      
      expect(result).toContain('---');
      expect(result).toContain('title: \'Sample Markdown Content\'');
      expect(result).toContain('author: \'Astro\'');
      expect(result).toContain('tags: [\'sample\', \'markdown\']');
      expect(result).toContain('# Sample Markdown Content');
      expect(result).toContain('## Features');
      expect(result).toContain('- Standard markdown formatting');
    });

    it('should merge custom frontmatter', () => {
      const result = contentTemplateMd({
        title: 'Custom Title',
        author: 'Jane Doe',
        frontmatter: { category: 'tutorial', rating: 5 }
      });
      
      expect(result).toContain('title: \'Custom Title\'');
      expect(result).toContain('author: \'Jane Doe\'');
      expect(result).toContain('category: \'tutorial\'');
      expect(result).toContain('rating: 5');
    });
  });

  describe('contentTemplateMdx', () => {
    it('should generate MDX content with imports', () => {
      const result = contentTemplateMdx();
      
      expect(result).toContain('---');
      expect(result).toContain('title: \'Sample MDX Content\'');
      expect(result).toContain('tags: [\'sample\', \'mdx\', \'react\']');
      expect(result).toContain('import { Alert } from');
      expect(result).toContain('<Alert type="info">');
      expect(result).toContain('JSX components');
      expect(result).toContain('{/* Example JSX component usage */}');
    });
  });

  describe('contentTemplateMarkdoc', () => {
    it('should generate Markdoc content with callouts', () => {
      const result = contentTemplateMarkdoc();
      
      expect(result).toContain('---');
      expect(result).toContain('title: \'Sample Markdoc Content\'');
      expect(result).toContain('tags: [\'sample\', \'markdoc\']');
      expect(result).toContain('{% callout type="note" %}');
      expect(result).toContain('Markdoc callout component');
      expect(result).toContain('Enhanced markdown syntax');
    });
  });

  describe('contentTemplateAsciidoc', () => {
    it('should generate AsciiDoc content', () => {
      const result = contentTemplateAsciidoc();
      
      expect(result).toContain('---');
      expect(result).toContain('title: \'Sample AsciiDoc Content\'');
      expect(result).toContain('doctitle: \'Sample AsciiDoc Content\'');
      expect(result).toContain('= Sample AsciiDoc Content');
      expect(result).toContain('== Features');
      expect(result).toContain('* Rich text formatting');
      expect(result).toContain('NOTE: AsciiDoc provides');
    });
  });

  describe('astroFileTemplate', () => {
    it('should delegate to appropriate template based on extension', () => {
      const astroResult = astroFileTemplate({ ext: 'astro', isPage: false });
      expect(astroResult).toContain('export interface Props');
      
      const mdResult = astroFileTemplate({ ext: 'md' });
      expect(mdResult).toContain('# Sample Markdown Content');
      
      const mdxResult = astroFileTemplate({ ext: 'mdx' });
      expect(mdxResult).toContain('import { Alert }');
    });
  });

  describe('getTemplateByExtension', () => {
    it('should return correct template for each extension', () => {
      const extensions = ['astro', 'md', 'mdx', 'mdoc', 'adoc'];
      
      extensions.forEach(ext => {
        const result = getTemplateByExtension(ext, { title: `Test ${ext.toUpperCase()}` });
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it('should handle page vs component distinction for astro files', () => {
      const componentResult = getTemplateByExtension('astro', { isPage: false });
      expect(componentResult).toContain('export interface Props');
      
      const pageResult = getTemplateByExtension('astro', { isPage: true });
      expect(pageResult).toContain('<html lang="en">');
    });
  });

  describe('generateTypeScriptInterface', () => {
    it('should generate TypeScript interface from props definition', () => {
      const result = generateTypeScriptInterface('Button', [
        { name: 'label', type: 'string' },
        { name: 'disabled', type: 'boolean', optional: true },
        { name: 'onClick', type: '() => void', optional: true }
      ]);
      
      expect(result).toContain('export interface ButtonProps {');
      expect(result).toContain('  label: string;');
      expect(result).toContain('  disabled?: boolean;');
      expect(result).toContain('  onClick?: () => void;');
      expect(result).toContain('}');
    });

    it('should handle Props suffix correctly', () => {
      const result = generateTypeScriptInterface('ButtonProps', [
        { name: 'label', type: 'string' }
      ]);
      
      expect(result).toContain('export interface ButtonProps {');
      expect(result).not.toContain('ButtonPropsProps');
    });
  });

  describe('Template consistency', () => {
    it('should generate non-empty templates for all functions', () => {
      const templates = [
        componentAstroTemplate(),
        pageAstroTemplate(),
        contentTemplateMd(),
        contentTemplateMdx(),
        contentTemplateMarkdoc(),
        contentTemplateAsciidoc(),
        astroFileTemplate()
      ];
      
      templates.forEach(template => {
        expect(template).toBeTruthy();
        expect(typeof template).toBe('string');
        expect(template.length).toBeGreaterThan(0);
        expect(template.trim()).not.toBe('');
      });
    });

    it('should handle undefined/empty options gracefully', () => {
      const templates = [
        () => componentAstroTemplate({}),
        () => pageAstroTemplate(undefined),
        () => contentTemplateMd({}),
        () => astroFileTemplate({})
      ];
      
      templates.forEach(templateFn => {
        expect(() => templateFn()).not.toThrow();
        const result = templateFn();
        expect(result).toBeTruthy();
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });
});
