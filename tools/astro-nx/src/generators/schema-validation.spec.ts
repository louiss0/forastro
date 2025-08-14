/**
 * Schema validation tests for all generator schemas
 * 
 * This test suite validates that generator schemas properly enforce required fields,
 * provide appropriate defaults for optional fields, and reject invalid inputs with
 * clear error messages.
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { ComponentGeneratorSchema } from './component/generator';
import type { PageGeneratorSchema } from './page/generator';
import type { ContentFileGeneratorSchema } from './content-file/generator';
import type { AstroFileGeneratorSchema } from './astro-file/generator';

describe('Generator Schema Validation', () => {
  let ajv: Ajv;

  beforeAll(() => {
    ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
  });

  describe('Component Generator Schema', () => {
    let componentSchema: any;
    let validate: any;

    beforeAll(() => {
      const schemaPath = join(__dirname, 'component/schema.json');
      componentSchema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
      validate = ajv.compile(componentSchema);
    });

    describe('Required Fields', () => {
      it('should require name field', () => {
        const options: Partial<ComponentGeneratorSchema> = {
          project: 'test-app'
        };

        const result = validate(options);

        expect(result).toBe(false);
        expect(validate.errors).toContainEqual(
          expect.objectContaining({
            instancePath: '',
            schemaPath: '#/required',
            keyword: 'required',
            params: expect.objectContaining({
              missingProperty: 'name'
            })
          })
        );
      });

      it('should require project field', () => {
        const options: Partial<ComponentGeneratorSchema> = {
          name: 'TestComponent'
        };

        const result = validate(options);

        expect(result).toBe(false);
        expect(validate.errors).toContainEqual(
          expect.objectContaining({
            instancePath: '',
            schemaPath: '#/required',
            keyword: 'required',
            params: expect.objectContaining({
              missingProperty: 'project'
            })
          })
        );
      });

      it('should accept minimal valid input with required fields', () => {
        const options: ComponentGeneratorSchema = {
          name: 'TestComponent',
          project: 'test-app'
        };

        const result = validate(options);

        expect(result).toBe(true);
        expect(validate.errors).toBeNull();
      });
    });

    describe('Optional Fields with Defaults', () => {
      it('should have appropriate defaults for ext field', () => {
        expect(componentSchema.properties.ext.default).toBe('astro');
        expect(componentSchema.properties.ext.enum).toEqual(['astro', 'mdx']);
      });

      it('should have appropriate defaults for style field', () => {
        expect(componentSchema.properties.style.default).toBe('scoped');
        expect(componentSchema.properties.style.enum).toEqual(['none', 'scoped', 'global']);
      });

      it('should have appropriate defaults for language field', () => {
        expect(componentSchema.properties.language.default).toBe('ts');
        expect(componentSchema.properties.language.enum).toEqual(['ts', 'js']);
      });

      it('should have appropriate defaults for skipFormat field', () => {
        expect(componentSchema.properties.skipFormat.default).toBe(false);
        expect(componentSchema.properties.skipFormat.type).toBe('boolean');
      });

      it('should accept optional fields with valid values', () => {
        const options: ComponentGeneratorSchema = {
          name: 'TestComponent',
          project: 'test-app',
          directory: 'ui/forms',
          props: 'title: string, count?: number',
          ext: 'mdx',
          style: 'none',
          language: 'js',
          skipFormat: true
        };

        const result = validate(options);

        expect(result).toBe(true);
        expect(validate.errors).toBeNull();
      });
    });

    describe('Invalid Input Rejection', () => {
      it('should reject invalid name patterns', () => {
        const testCases = [
          { name: '', description: 'empty string' },
          { name: '123Component', description: 'starts with number' },
          { name: 'component-with-dashes', description: 'contains dashes' },
          { name: 'component with spaces', description: 'contains spaces' },
          { name: 'component_with_underscores', description: 'contains underscores' },
          { name: 'A'.repeat(51), description: 'exceeds max length' }
        ];

        testCases.forEach(({ name, description }) => {
          const options = { name, project: 'test-app' };
          const result = validate(options);

          expect(result).toBe(false);
          expect(validate.errors).toContainEqual(
            expect.objectContaining({
              instancePath: '/name',
              schemaPath: expect.stringMatching(/#\/properties\/name\/(pattern|minLength|maxLength)/)
            })
          );
        });
      });

      it('should reject invalid directory patterns', () => {
        const options: ComponentGeneratorSchema = {
          name: 'TestComponent',
          project: 'test-app',
          directory: 'invalid directory with spaces and special!@#characters'
        };

        const result = validate(options);

        expect(result).toBe(false);
        expect(validate.errors).toContainEqual(
          expect.objectContaining({
            instancePath: '/directory',
            schemaPath: '#/properties/directory/pattern'
          })
        );
      });

      it('should reject invalid props patterns', () => {
        const options: ComponentGeneratorSchema = {
          name: 'TestComponent',
          project: 'test-app',
          props: 'invalid props syntax @#$%'
        };

        const result = validate(options);

        expect(result).toBe(false);
        expect(validate.errors).toContainEqual(
          expect.objectContaining({
            instancePath: '/props',
            schemaPath: '#/properties/props/pattern'
          })
        );
      });

      it('should reject invalid ext values', () => {
        const options = {
          name: 'TestComponent',
          project: 'test-app',
          ext: 'invalid'
        };

        const result = validate(options);

        expect(result).toBe(false);
        expect(validate.errors).toContainEqual(
          expect.objectContaining({
            instancePath: '/ext',
            schemaPath: '#/properties/ext/enum'
          })
        );
      });

      it('should reject additional properties', () => {
        const options = {
          name: 'TestComponent',
          project: 'test-app',
          invalidProperty: 'should not be allowed'
        };

        const result = validate(options);

        expect(result).toBe(false);
        expect(validate.errors).toContainEqual(
          expect.objectContaining({
            instancePath: '',
            schemaPath: '#/additionalProperties'
          })
        );
      });
    });
  });

  describe('Page Generator Schema', () => {
    let pageSchema: any;
    let validate: any;

    beforeAll(() => {
      const schemaPath = join(__dirname, 'page/schema.json');
      pageSchema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
      validate = ajv.compile(pageSchema);
    });

    describe('Required Fields', () => {
      it('should require name and project fields', () => {
        const options = {};

        const result = validate(options);

        expect(result).toBe(false);
        expect(validate.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              instancePath: '',
              keyword: 'required',
              params: expect.objectContaining({
                missingProperty: 'name'
              })
            }),
            expect.objectContaining({
              instancePath: '',
              keyword: 'required',
              params: expect.objectContaining({
                missingProperty: 'project'
              })
            })
          ])
        );
      });

      it('should accept valid dynamic route names', () => {
        const testCases = [
          'about',
          'blog/[slug]',
          'products/[...path]',
          'api/users/[id]',
          'docs/[category]/[slug]'
        ];

        testCases.forEach(name => {
          const options: PageGeneratorSchema = {
            name,
            project: 'test-app'
          };

          const result = validate(options);

          expect(result).toBe(true);
        });
      });
    });

    describe('Optional Fields with Defaults', () => {
      it('should have appropriate defaults for ext field', () => {
        expect(pageSchema.properties.ext.default).toBe('astro');
        expect(pageSchema.properties.ext.enum).toEqual(['astro', 'md', 'adoc', 'mdx', 'mdoc']);
      });

      it('should have appropriate defaults for skipFormat field', () => {
        expect(pageSchema.properties.skipFormat.default).toBe(false);
      });

      it('should accept complex frontmatter objects', () => {
        const options: PageGeneratorSchema = {
          name: 'blog-post',
          project: 'test-app',
          frontmatter: {
            title: 'My Blog Post',
            description: 'A great post',
            tags: ['tech', 'astro'],
            publishDate: '2024-01-15',
            draft: false,
            customField: 'custom value'
          }
        };

        const result = validate(options);

        expect(result).toBe(true);
        expect(validate.errors).toBeNull();
      });
    });

    describe('Invalid Input Rejection', () => {
      it('should reject invalid name patterns', () => {
        const options = {
          name: 'invalid name with spaces',
          project: 'test-app'
        };

        const result = validate(options);

        expect(result).toBe(false);
        expect(validate.errors).toContainEqual(
          expect.objectContaining({
            instancePath: '/name',
            schemaPath: '#/properties/name/pattern'
          })
        );
      });

      it('should reject names exceeding max length', () => {
        const options = {
          name: 'a'.repeat(101),
          project: 'test-app'
        };

        const result = validate(options);

        expect(result).toBe(false);
        expect(validate.errors).toContainEqual(
          expect.objectContaining({
            instancePath: '/name',
            schemaPath: '#/properties/name/maxLength'
          })
        );
      });

      it('should reject invalid layout patterns', () => {
        const options: PageGeneratorSchema = {
          name: 'test-page',
          project: 'test-app',
          layout: 'invalid layout with spaces!@#'
        };

        const result = validate(options);

        expect(result).toBe(false);
        expect(validate.errors).toContainEqual(
          expect.objectContaining({
            instancePath: '/layout',
            schemaPath: '#/properties/layout/pattern'
          })
        );
      });

      it('should reject invalid date formats in frontmatter', () => {
        const options: PageGeneratorSchema = {
          name: 'test-page',
          project: 'test-app',
          frontmatter: {
            publishDate: 'invalid-date-format'
          }
        };

        const result = validate(options);

        expect(result).toBe(false);
        expect(validate.errors).toContainEqual(
          expect.objectContaining({
            instancePath: '/frontmatter/publishDate',
            schemaPath: '#/properties/frontmatter/properties/publishDate/format'
          })
        );
      });
    });
  });

  describe('Content File Generator Schema', () => {
    let contentSchema: any;
    let validate: any;

    beforeAll(() => {
      const schemaPath = join(__dirname, 'content-file/schema.json');
      contentSchema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
      validate = ajv.compile(contentSchema);
    });

    describe('Required Fields', () => {
      it('should require name and project fields', () => {
        const options = {};

        const result = validate(options);

        expect(result).toBe(false);
        expect(validate.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              keyword: 'required',
              params: expect.objectContaining({
                missingProperty: 'name'
              })
            }),
            expect.objectContaining({
              keyword: 'required',
              params: expect.objectContaining({
                missingProperty: 'project'
              })
            })
          ])
        );
      });

      it('should require either collection or directory field', () => {
        const options = {
          name: 'test-content',
          project: 'test-app'
        };

        const result = validate(options);

        // This should fail because neither collection nor directory is provided
        expect(result).toBe(false);
        expect(validate.errors).toContainEqual(
          expect.objectContaining({
            keyword: 'oneOf'
          })
        );
      });

      it('should accept valid input with collection', () => {
        const options: ContentFileGeneratorSchema = {
          name: 'test-content',
          project: 'test-app',
          collection: 'blog'
        };

        const result = validate(options);

        expect(result).toBe(true);
        expect(validate.errors).toBeNull();
      });

      it('should accept valid input with directory', () => {
        const options: ContentFileGeneratorSchema = {
          name: 'test-content',
          project: 'test-app',
          directory: 'custom/path'
        };

        const result = validate(options);

        expect(result).toBe(true);
        expect(validate.errors).toBeNull();
      });
    });

    describe('Optional Fields with Defaults', () => {
      it('should have appropriate defaults for ext field', () => {
        expect(contentSchema.properties.ext.default).toBe('md');
        expect(contentSchema.properties.ext.enum).toEqual(['md', 'mdx', 'mdoc', 'adoc']);
      });

      it('should have appropriate defaults for skipFormat field', () => {
        expect(contentSchema.properties.skipFormat.default).toBe(false);
      });

      it('should accept frontmatter with tags array', () => {
        const options: ContentFileGeneratorSchema = {
          name: 'test-content',
          project: 'test-app',
          collection: 'blog',
          frontmatter: {
            title: 'Test Content',
            tags: ['test', 'content', 'astro']
          }
        };

        const result = validate(options);

        expect(result).toBe(true);
        expect(validate.errors).toBeNull();
      });
    });

    describe('Invalid Input Rejection', () => {
      it('should reject invalid name patterns', () => {
        const options = {
          name: 'invalid name with spaces',
          project: 'test-app',
          collection: 'blog'
        };

        const result = validate(options);

        expect(result).toBe(false);
        expect(validate.errors).toContainEqual(
          expect.objectContaining({
            instancePath: '/name',
            schemaPath: '#/properties/name/pattern'
          })
        );
      });

      it('should reject invalid collection patterns', () => {
        const options: ContentFileGeneratorSchema = {
          name: 'test-content',
          project: 'test-app',
          collection: '123-invalid-collection'
        };

        const result = validate(options);

        expect(result).toBe(false);
        expect(validate.errors).toContainEqual(
          expect.objectContaining({
            instancePath: '/collection',
            schemaPath: '#/properties/collection/pattern'
          })
        );
      });

      it('should reject names exceeding max length', () => {
        const options = {
          name: 'a'.repeat(101),
          project: 'test-app',
          collection: 'blog'
        };

        const result = validate(options);

        expect(result).toBe(false);
        expect(validate.errors).toContainEqual(
          expect.objectContaining({
            instancePath: '/name',
            schemaPath: '#/properties/name/maxLength'
          })
        );
      });

      it('should reject title exceeding max length', () => {
        const options: ContentFileGeneratorSchema = {
          name: 'test-content',
          project: 'test-app',
          collection: 'blog',
          title: 'a'.repeat(201)
        };

        const result = validate(options);

        expect(result).toBe(false);
        expect(validate.errors).toContainEqual(
          expect.objectContaining({
            instancePath: '/title',
            schemaPath: '#/properties/title/maxLength'
          })
        );
      });
    });
  });

  describe('Astro File Generator Schema', () => {
    let astroFileSchema: any;
    let validate: any;

    beforeAll(() => {
      const schemaPath = join(__dirname, 'astro-file/schema.json');
      astroFileSchema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
      validate = ajv.compile(astroFileSchema);
    });

    describe('Schema Validation', () => {
      it('should load astro-file schema successfully', () => {
        expect(astroFileSchema).toBeDefined();
        expect(astroFileSchema.type).toBe('object');
        expect(astroFileSchema.properties).toBeDefined();
      });

      it('should require name and project fields', () => {
        const options = {};

        const result = validate(options);

        expect(result).toBe(false);
        expect(validate.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              keyword: 'required',
              params: expect.objectContaining({
                missingProperty: 'name'
              })
            }),
            expect.objectContaining({
              keyword: 'required', 
              params: expect.objectContaining({
                missingProperty: 'project'
              })
            })
          ])
        );
      });
    });
  });

  describe('Cross-Schema Consistency', () => {
    let schemas: Record<string, any> = {};

    beforeAll(() => {
      const schemaFiles = [
        'component/schema.json',
        'page/schema.json',
        'content-file/schema.json',
        'astro-file/schema.json'
      ];

      schemaFiles.forEach(file => {
        const schemaPath = join(__dirname, file);
        const schemaName = file.split('/')[0];
        schemas[schemaName] = JSON.parse(readFileSync(schemaPath, 'utf-8'));
      });
    });

    it('should have consistent version numbers', () => {
      const versions = Object.values(schemas).map(schema => schema.version);
      const uniqueVersions = [...new Set(versions)];
      
      expect(uniqueVersions.length).toBe(1);
      expect(uniqueVersions[0]).toBe(2);
    });

    it('should have consistent JSON Schema version', () => {
      const schemaVersions = Object.values(schemas).map(schema => schema.$schema);
      const uniqueSchemaVersions = [...new Set(schemaVersions)];
      
      expect(uniqueSchemaVersions.length).toBe(1);
      expect(uniqueSchemaVersions[0]).toBe('http://json-schema.org/draft-07/schema#');
    });

    it('should consistently require name and project fields', () => {
      Object.entries(schemas).forEach(([name, schema]) => {
        expect(schema.required).toContain('name');
        expect(schema.required).toContain('project');
      });
    });

    it('should consistently prohibit additional properties', () => {
      Object.entries(schemas).forEach(([name, schema]) => {
        expect(schema.additionalProperties).toBe(false);
      });
    });

    it('should have consistent skipFormat field definitions', () => {
      Object.entries(schemas).forEach(([name, schema]) => {
        if (schema.properties.skipFormat) {
          expect(schema.properties.skipFormat.type).toBe('boolean');
          expect(schema.properties.skipFormat.default).toBe(false);
        }
      });
    });

    it('should have consistent name field validation patterns', () => {
      Object.entries(schemas).forEach(([name, schema]) => {
        if (schema.properties.name) {
          expect(schema.properties.name.type).toBe('string');
          expect(schema.properties.name.minLength).toBeGreaterThan(0);
          expect(schema.properties.name.maxLength).toBeGreaterThan(0);
          expect(schema.properties.name.pattern).toBeDefined();
        }
      });
    });
  });

  describe('Error Message Quality', () => {
    let componentValidate: any;

    beforeAll(() => {
      const schemaPath = join(__dirname, 'component/schema.json');
      const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
      componentValidate = ajv.compile(schema);
    });

    it('should provide clear error messages for missing required fields', () => {
      const options = {};
      componentValidate(options);

      const errorMessages = componentValidate.errors?.map((error: any) => error.message) || [];
      
      expect(errorMessages).toEqual(
        expect.arrayContaining([
          "must have required property 'name'",
          "must have required property 'project'"
        ])
      );
    });

    it('should provide clear error messages for pattern violations', () => {
      const options = {
        name: 'invalid-name-with-dashes',
        project: 'test-app'
      };
      
      componentValidate(options);

      const patternErrors = componentValidate.errors?.filter((error: any) => 
        error.keyword === 'pattern'
      ) || [];
      
      expect(patternErrors.length).toBeGreaterThan(0);
      expect(patternErrors[0].message).toMatch(/must match pattern/);
    });

    it('should provide clear error messages for enum violations', () => {
      const options = {
        name: 'TestComponent',
        project: 'test-app',
        ext: 'invalid'
      };
      
      componentValidate(options);

      const enumErrors = componentValidate.errors?.filter((error: any) => 
        error.keyword === 'enum'
      ) || [];
      
      expect(enumErrors.length).toBeGreaterThan(0);
      expect(enumErrors[0].message).toMatch(/must be equal to one of the allowed values/);
    });
  });
});
