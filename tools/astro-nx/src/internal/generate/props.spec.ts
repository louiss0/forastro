import {
  parseProps,
  emitAstroPropsInterface,
  createFrontmatterObject,
  generateComponentImport,
  generateLayoutImport,
  generateComponentProps,
  generatePageProps,
  generateContentProps,
  generateGenericProps,
} from './props';

describe('Props Generation', () => {
  describe('parseProps', () => {
    test('should parse simple prop specification', () => {
      const result = parseProps('title:string,count:number');

      expect(result).toEqual([
        { name: 'title', type: 'string' },
        { name: 'count', type: 'number' }
      ]);
    });

    test('should handle boolean types', () => {
      const result = parseProps('isVisible:boolean');

      expect(result).toEqual([
        { name: 'isVisible', type: 'boolean' }
      ]);
    });

    test('should handle complex types', () => {
      const result = parseProps('data:string[],callback:Function');

      expect(result).toEqual([
        { name: 'data', type: 'string[]' },
        { name: 'callback', type: 'Function' }
      ]);
    });

    test('should trim whitespace', () => {
      const result = parseProps(' title : string , count : number ');

      expect(result).toEqual([
        { name: 'title', type: 'string' },
        { name: 'count', type: 'number' }
      ]);
    });

    test('should handle empty specification', () => {
      expect(parseProps('')).toEqual([]);
      expect(parseProps('   ')).toEqual([]);
    });

    test('should filter out empty prop definitions', () => {
      const result = parseProps('title:string,,count:number,');

      expect(result).toEqual([
        { name: 'title', type: 'string' },
        { name: 'count', type: 'number' }
      ]);
    });

    test('should throw error for invalid prop format', () => {
      expect(() => parseProps('title')).toThrow('Invalid prop specification: "title". Expected format: "name:type"');
    });

    test('should throw error for missing type', () => {
      expect(() => parseProps('title:')).toThrow('Invalid prop specification: "title:". Expected format: "name:type"');
    });

    test('should throw error for missing name', () => {
      expect(() => parseProps(':string')).toThrow('Invalid prop specification: ":string". Expected format: "name:type"');
    });

    test('should handle single prop', () => {
      const result = parseProps('title:string');

      expect(result).toEqual([
        { name: 'title', type: 'string' }
      ]);
    });

    test('should handle union types', () => {
      const result = parseProps('status:success|error|loading');

      expect(result).toEqual([
        { name: 'status', type: 'success|error|loading' }
      ]);
    });
  });

  describe('emitAstroPropsInterface', () => {
    test('should generate interface and extraction for single prop', () => {
      const props = [{ name: 'title', type: 'string' }];
      const result = emitAstroPropsInterface(props);

      expect(result.interface).toBe(`interface Props {
  title: string;
}`);
      expect(result.propsExtraction).toBe('const { title } = Astro.props;');
    });

    test('should generate interface and extraction for multiple props', () => {
      const props = [
        { name: 'title', type: 'string' },
        { name: 'count', type: 'number' },
        { name: 'isVisible', type: 'boolean' }
      ];
      const result = emitAstroPropsInterface(props);

      expect(result.interface).toBe(`interface Props {
  title: string;
  count: number;
  isVisible: boolean;
}`);
      expect(result.propsExtraction).toBe('const { title, count, isVisible } = Astro.props;');
    });

    test('should handle complex types', () => {
      const props = [
        { name: 'data', type: 'string[]' },
        { name: 'callback', type: '(x: number) => void' },
        { name: 'config', type: '{ theme: string; debug: boolean }' }
      ];
      const result = emitAstroPropsInterface(props);

      expect(result.interface).toBe(`interface Props {
  data: string[];
  callback: (x: number) => void;
  config: { theme: string; debug: boolean };
}`);
      expect(result.propsExtraction).toBe('const { data, callback, config } = Astro.props;');
    });

    test('should return empty strings for no props', () => {
      const result = emitAstroPropsInterface([]);

      expect(result.interface).toBe('');
      expect(result.propsExtraction).toBe('');
    });
  });

  describe('createFrontmatterObject', () => {
    test('should create frontmatter for string values', () => {
      const fields = { title: 'Hello World', author: 'John Doe' };
      const result = createFrontmatterObject(fields);

      expect(result).toBe("title: 'Hello World'\\nauthor: 'John Doe'");
    });

    test('should create frontmatter for boolean values', () => {
      const fields = { published: true, draft: false };
      const result = createFrontmatterObject(fields);

      expect(result).toBe('published: true\\ndraft: false');
    });

    test('should create frontmatter for number values', () => {
      const fields = { version: 1, rating: 4.5 };
      const result = createFrontmatterObject(fields);

      expect(result).toBe('version: 1\\nrating: 4.5');
    });

    test('should create frontmatter for array values', () => {
      const fields = { tags: ['astro', 'web', 'frontend'] };
      const result = createFrontmatterObject(fields);

      expect(result).toBe("tags: ['astro', 'web', 'frontend']");
    });

    test('should create frontmatter for mixed array values', () => {
      const fields = { data: ['text', 123, true] };
      const result = createFrontmatterObject(fields);

      expect(result).toBe("data: ['text', 123, true]");
    });

    test('should create frontmatter for object values', () => {
      const fields = { config: { theme: 'dark', debug: true } };
      const result = createFrontmatterObject(fields);

      expect(result).toBe('config: {"theme":"dark","debug":true}');
    });

    test('should handle empty fields', () => {
      const result = createFrontmatterObject({});

      expect(result).toBe('');
    });

    test('should handle mixed field types', () => {
      const fields = {
        title: 'Test',
        count: 5,
        active: true,
        tags: ['test'],
        meta: { version: '1.0' }
      };
      const result = createFrontmatterObject(fields);

      expect(result).toBe("title: 'Test'\\ncount: 5\\nactive: true\\ntags: ['test']\\nmeta: {\"version\":\"1.0\"}");
    });
  });

  describe('generateComponentImport', () => {
    test('should generate component import with PascalCase', () => {
      const result = generateComponentImport('my-button', './components/MyButton.astro');

      expect(result).toBe("import MyButton from './components/MyButton.astro';");
    });

    test('should handle kebab-case component names', () => {
      const result = generateComponentImport('user-profile-card', '../UserProfileCard.astro');

      expect(result).toBe("import UserProfileCard from '../UserProfileCard.astro';");
    });
  });

  describe('generateLayoutImport', () => {
    test('should generate layout import with PascalCase', () => {
      const result = generateLayoutImport('base-layout', './layouts/BaseLayout.astro');

      expect(result).toBe("import BaseLayout from './layouts/BaseLayout.astro';");
    });
  });

  describe('generateComponentProps', () => {
    test('should generate basic component props', () => {
      const options = {
        name: 'my-button',
        directory: '/project/src/components',
        projectName: 'my-app',
        projectRoot: '/project'
      };

      const result = generateComponentProps(options);

      expect(result.name).toBe('my-button');
      expect(result.className).toBe('MyButton');
      expect(result.fileName).toBe('my-button');
      expect(result.tagName).toBe('my-button');
      expect(result.hasProps).toBe(false);
      expect(result.propsInterface).toBeUndefined();
    });

    test('should generate component props with props', () => {
      const options = {
        name: 'my-button',
        directory: '/project/src/components',
        projectName: 'my-app',
        projectRoot: '/project',
        hasProps: true
      };

      const result = generateComponentProps(options);

      expect(result.hasProps).toBe(true);
      expect(result.propsInterface).toBe('MyButtonProps');
    });

    test('should generate component props with framework', () => {
      const options = {
        name: 'react-button',
        directory: '/project/src/components',
        projectName: 'my-app',
        projectRoot: '/project',
        framework: 'react',
        isClientComponent: true
      };

      const result = generateComponentProps(options);

      expect(result.framework).toBe('react');
      expect(result.isClientComponent).toBe(true);
    });
  });

  describe('generatePageProps', () => {
    test('should generate basic page props', () => {
      const options = {
        name: 'about',
        directory: '/project/src/pages',
        projectName: 'my-app',
        projectRoot: '/project'
      };

      const result = generatePageProps(options);

      expect(result.name).toBe('about');
      expect(result.className).toBe('About');
      expect(result.fileName).toBe('about');
      expect(result.title).toBe('About');
      expect(result.contentType).toBe('astro');
      expect(result.isMarkdown).toBe(false);
    });

    test('should generate page props with custom title and description', () => {
      const options = {
        name: 'contact',
        directory: '/project/src/pages',
        projectName: 'my-app',
        projectRoot: '/project',
        title: 'Contact Us',
        description: 'Get in touch with our team'
      };

      const result = generatePageProps(options);

      expect(result.title).toBe('Contact Us');
      expect(result.description).toBe('Get in touch with our team');
    });

    test('should generate page props for markdown content', () => {
      const options = {
        name: 'blog-post',
        directory: '/project/src/pages',
        projectName: 'my-app',
        projectRoot: '/project',
        contentType: 'mdx' as const
      };

      const result = generatePageProps(options);

      expect(result.contentType).toBe('mdx');
      expect(result.isMarkdown).toBe(true);
    });
  });

  describe('generateContentProps', () => {
    test('should generate basic content props', () => {
      const options = {
        name: 'first-post',
        directory: '/project/src/content/blog',
        projectName: 'my-app',
        projectRoot: '/project',
        collection: 'blog'
      };

      const result = generateContentProps(options);

      expect(result.name).toBe('first-post');
      expect(result.className).toBe('FirstPost');
      expect(result.fileName).toBe('first-post');
      expect(result.collection).toBe('blog');
      expect(result.contentFormat).toBe('md');
    });

    test('should generate content props with custom format and schema', () => {
      const options = {
        name: 'tutorial',
        directory: '/project/src/content/docs',
        projectName: 'my-app',
        projectRoot: '/project',
        collection: 'docs',
        contentFormat: 'mdx' as const,
        schema: 'docsSchema'
      };

      const result = generateContentProps(options);

      expect(result.contentFormat).toBe('mdx');
      expect(result.schema).toBe('docsSchema');
    });

    test('should generate content props with frontmatter fields', () => {
      const options = {
        name: 'article',
        directory: '/project/src/content/blog',
        projectName: 'my-app',
        projectRoot: '/project',
        collection: 'blog',
        frontmatterFields: { title: 'Sample Article', published: true }
      };

      const result = generateContentProps(options);

      expect(result.frontmatterFields).toEqual({ title: 'Sample Article', published: true });
    });
  });

  describe('generateGenericProps', () => {
    test('should generate generic props', () => {
      const options = {
        name: 'utility-file',
        directory: '/project/src/utils',
        projectName: 'my-app',
        projectRoot: '/project'
      };

      const result = generateGenericProps(options);

      expect(result.name).toBe('utility-file');
      expect(result.className).toBe('UtilityFile');
      expect(result.fileName).toBe('utility-file');
      expect(result.directory).toBe('/project/src/utils');
      expect(result.projectName).toBe('my-app');
      expect(result.projectRoot).toBe('/project');
    });
  });
});
