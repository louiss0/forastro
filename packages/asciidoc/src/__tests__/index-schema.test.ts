import { describe, it, expect } from 'vitest';
import {
  asciidocBaseSchema,
  asciidocDraftSchema,
  ASCIIDOC_POST_STAGE,
  type AsciidocBaseSchema,
  type AsciidocPostStage,
} from '../index';

describe('AsciiDoc Schema Tests', () => {
  describe('asciidocBaseSchema', () => {
    describe('valid configurations', () => {
      it('should parse minimal valid configuration', () => {
        const minimalConfig = {
          doctitle: 'Test Document',
          docdate: '2023-12-25',
          email: 'test@example.com',
          localdate: '2023-12-25',
          author: 'John Doe',
          authors: 'John Doe',
          createdAt: '2023-12-25',
          description: 'This is a valid description that meets the minimum length requirements for testing purposes.',
        };

        const result = asciidocBaseSchema.safeParse(minimalConfig);
        expect(result.success).toBe(true);
        
        if (result.success) {
          expect(result.data.title).toBe('Test Document');
          expect(result.data.updatedAt).toBe('2023-12-25');
          expect(result.data.author).toBe('John Doe');
          expect(result.data.description).toBe(minimalConfig.description);
        }
      });

      it('should parse full valid configuration with multiple authors', () => {
        const fullConfig = {
          doctitle: 'Complete Test Document',
          docdate: '2023-12-25',
          email: 'author@example.com',
          localdate: '2023-12-25',
          author: 'Jane Smith',
          authors: ['Jane Smith', 'John Doe'],
          createdAt: '2023-12-25',
          description: 'This is a comprehensive description that provides detailed information about the document content and purpose.',
        };

        const result = asciidocBaseSchema.safeParse(fullConfig);
        expect(result.success).toBe(true);
        
        if (result.success) {
          expect(result.data.title).toBe('Complete Test Document');
          expect(result.data.authors).toEqual(['Jane Smith', 'John Doe']);
        }
      });

      it('should handle proper author name format', () => {
        const validAuthors = [
          'John Doe',
          'Mary Jane Smith',
          'Dr. Jane Smith',
          'John A. Doe',
          'Mary Jane Watson',
        ];

        validAuthors.forEach((author) => {
          const config = {
            doctitle: 'Test Doc',
            docdate: '2023-12-25',
            email: 'test@example.com',
            localdate: '2023-12-25',
            author,
            authors: author,
            createdAt: '2023-12-25',
            description: 'This is a valid description that meets the minimum length requirements for testing purposes.',
          };

          const result = asciidocBaseSchema.safeParse(config);
          expect(result.success).toBe(true);
        });
      });
    });

    describe('invalid configurations', () => {
      it('should reject invalid doctitle format', () => {
        const invalidTitleConfig = {
          doctitle: '', // Empty string violates the regex pattern \w\s\d
          docdate: '2023-12-25',
          email: 'test@example.com',
          localdate: '2023-12-25',
          author: 'John Doe',
          authors: 'John Doe',
          createdAt: '2023-12-25',
          description: 'This is a valid description that meets the minimum length requirements for testing purposes.',
        };

        const result = asciidocBaseSchema.safeParse(invalidTitleConfig);
        expect(result.success).toBe(false);
        
        if (!result.success) {
          expect(result.error.issues).toContainEqual(
            expect.objectContaining({
              path: ['doctitle'],
              code: 'invalid_string',
            })
          );
        }
      });

      it('should reject invalid date formats', () => {
        const invalidDates = ['not-a-date', '2023/12/25', '25-12-2023', '2023-13-01'];
        
        invalidDates.forEach((invalidDate) => {
          const config = {
            doctitle: 'Test Document',
            docdate: invalidDate,
            email: 'test@example.com',
            localdate: '2023-12-25',
            author: 'John Doe',
            authors: 'John Doe',
            createdAt: '2023-12-25',
            description: 'This is a valid description that meets the minimum length requirements for testing purposes.',
          };

          const result = asciidocBaseSchema.safeParse(config);
          expect(result.success).toBe(false);
        });
      });

      it('should reject invalid email formats', () => {
        const invalidEmails = ['not-an-email', 'test@', '@example.com', 'test.example.com'];
        
        invalidEmails.forEach((invalidEmail) => {
          const config = {
            doctitle: 'Test Document',
            docdate: '2023-12-25',
            email: invalidEmail,
            localdate: '2023-12-25',
            author: 'John Doe',
            authors: 'John Doe',
            createdAt: '2023-12-25',
            description: 'This is a valid description that meets the minimum length requirements for testing purposes.',
          };

          const result = asciidocBaseSchema.safeParse(config);
          expect(result.success).toBe(false);
        });
      });

      it('should reject invalid author name formats', () => {
        const invalidAuthors = ['john', 'JOHN DOE', 'john doe', '123 456', 'John'];
        
        invalidAuthors.forEach((invalidAuthor) => {
          const config = {
            doctitle: 'Test Document',
            docdate: '2023-12-25',
            email: 'test@example.com',
            localdate: '2023-12-25',
            author: invalidAuthor,
            authors: invalidAuthor,
            createdAt: '2023-12-25',
            description: 'This is a valid description that meets the minimum length requirements for testing purposes.',
          };

          const result = asciidocBaseSchema.safeParse(config);
          expect(result.success).toBe(false);
        });
      });

      it('should reject descriptions that are too short', () => {
        const config = {
          doctitle: 'Test Document',
          docdate: '2023-12-25',
          email: 'test@example.com',
          localdate: '2023-12-25',
          author: 'John Doe',
          authors: 'John Doe',
          createdAt: '2023-12-25',
          description: 'Too short',
        };

        const result = asciidocBaseSchema.safeParse(config);
        expect(result.success).toBe(false);
        
        if (!result.success) {
          expect(result.error.issues).toContainEqual(
            expect.objectContaining({
              path: ['description'],
              code: 'too_small',
            })
          );
        }
      });

      it('should reject descriptions that are too long', () => {
        const config = {
          doctitle: 'Test Document',
          docdate: '2023-12-25',
          email: 'test@example.com',
          localdate: '2023-12-25',
          author: 'John Doe',
          authors: 'John Doe',
          createdAt: '2023-12-25',
          description: 'A'.repeat(161), // 161 characters, exceeds max of 160
        };

        const result = asciidocBaseSchema.safeParse(config);
        expect(result.success).toBe(false);
        
        if (!result.success) {
          expect(result.error.issues).toContainEqual(
            expect.objectContaining({
              path: ['description'],
              code: 'too_big',
            })
          );
        }
      });
    });

    describe('transform behavior', () => {
      it('should transform doctitle to title and docdate to updatedAt', () => {
        const config = {
          doctitle: 'Original Title',
          docdate: '2023-12-25',
          email: 'test@example.com',
          localdate: '2023-12-25',
          author: 'John Doe',
          authors: 'John Doe',
          createdAt: '2023-12-25',
          description: 'This is a valid description that meets the minimum length requirements for testing purposes.',
        };

        const result = asciidocBaseSchema.safeParse(config);
        expect(result.success).toBe(true);
        
        if (result.success) {
          expect(result.data).toHaveProperty('title', 'Original Title');
          expect(result.data).toHaveProperty('updatedAt', '2023-12-25');
          expect(result.data).not.toHaveProperty('doctitle');
          expect(result.data).not.toHaveProperty('docdate');
        }
      });

      it('should preserve other fields unchanged', () => {
        const config = {
          doctitle: 'Test Document',
          docdate: '2023-12-25',
          email: 'test@example.com',
          localdate: '2023-12-24',
          author: 'John Doe',
          authors: 'John Doe',
          createdAt: '2023-12-23',
          description: 'This is a valid description that meets the minimum length requirements for testing purposes.',
        };

        const result = asciidocBaseSchema.safeParse(config);
        expect(result.success).toBe(true);
        
        if (result.success) {
          expect(result.data.email).toBe('test@example.com');
          expect(result.data.localdate).toBe('2023-12-24');
          expect(result.data.createdAt).toBe('2023-12-23');
          expect(result.data.author).toBe('John Doe');
          expect(result.data.description).toBe(config.description);
        }
      });
    });
  });

  describe('ASCIIDOC_POST_STAGE enum', () => {
    it('should contain expected stage values', () => {
      const stages = ASCIIDOC_POST_STAGE.options;
      expect(stages).toEqual(['draft', 'published', 'editing']);
    });

    it('should parse valid stage values', () => {
      const validStages: AsciidocPostStage[] = ['draft', 'published', 'editing'];
      
      validStages.forEach((stage) => {
        const result = ASCIIDOC_POST_STAGE.safeParse(stage);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid stage values', () => {
      const invalidStages = ['invalid', 'DRAFT', 'pending', ''];
      
      invalidStages.forEach((stage) => {
        const result = ASCIIDOC_POST_STAGE.safeParse(stage);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('asciidocDraftSchema', () => {
    it('should parse valid draft configuration', () => {
      const draftConfig = {
        doctitle: 'Draft Document',
        docdate: '2023-12-25',
        email: 'test@example.com',
        localdate: '2023-12-25',
        author: 'John Doe',
        authors: 'John Doe',
        createdAt: '2023-12-25',
        description: 'This is a draft document with proper description length for testing purposes and validation.',
        stage: 'draft' as AsciidocPostStage,
      };

      const result = asciidocDraftSchema.safeParse(draftConfig);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.stage).toBe('draft');
        expect(result.data.title).toBe('Draft Document');
      }
    });

    it('should parse configuration with published stage', () => {
      const publishedConfig = {
        doctitle: 'Published Document',
        docdate: '2023-12-25',
        email: 'test@example.com',
        localdate: '2023-12-25',
        author: 'John Doe',
        authors: 'John Doe',
        createdAt: '2023-12-25',
        description: 'This is a published document with proper description length for testing purposes and validation.',
        stage: 'published' as AsciidocPostStage,
      };

      const result = asciidocDraftSchema.safeParse(publishedConfig);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.stage).toBe('published');
      }
    });

    it('should reject configuration with invalid stage', () => {
      const invalidConfig = {
        doctitle: 'Test Document',
        docdate: '2023-12-25',
        email: 'test@example.com',
        localdate: '2023-12-25',
        author: 'John Doe',
        authors: 'John Doe',
        createdAt: '2023-12-25',
        description: 'This is a valid description that meets the minimum length requirements for testing purposes.',
        stage: 'invalid-stage',
      };

      const result = asciidocDraftSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should inherit base schema validation rules', () => {
      const invalidBaseConfig = {
        doctitle: '!!Invalid##',
        docdate: '2023-12-25',
        email: 'invalid-email',
        localdate: '2023-12-25',
        author: 'john',
        authors: 'john',
        createdAt: '2023-12-25',
        description: 'Short',
        stage: 'draft' as AsciidocPostStage,
      };

      const result = asciidocDraftSchema.safeParse(invalidBaseConfig);
      expect(result.success).toBe(false);
    });
  });

  describe('type inference', () => {
    it('should correctly infer AsciidocBaseSchema type', () => {
      const config = {
        doctitle: 'Test Document',
        docdate: '2023-12-25',
        email: 'test@example.com',
        localdate: '2023-12-25',
        author: 'John Doe',
        authors: 'John Doe',
        createdAt: '2023-12-25',
        description: 'This is a valid description that meets the minimum length requirements for testing purposes.',
      };

      const result = asciidocBaseSchema.safeParse(config);
      expect(result.success).toBe(true);
      
      if (result.success) {
        // TypeScript should infer this as AsciidocBaseSchema
        const data: AsciidocBaseSchema = result.data;
        expect(data.title).toBeDefined();
        expect(data.updatedAt).toBeDefined();
      }
    });
  });
});
