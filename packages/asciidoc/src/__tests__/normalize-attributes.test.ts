import { describe, it, expect } from 'vitest';
import { normalizeAsciiDocAttributes, type DocumentAttributes } from '../lib/asciidoc';

describe('normalizeAsciiDocAttributes', () => {
  it('should convert empty strings to true', () => {
    const input: DocumentAttributes = {
      'empty-attr': '',
      'normal-attr': 'value',
    };

    const result = normalizeAsciiDocAttributes(input);

    expect(result).toEqual({
      emptyAttr: true,
      normalAttr: 'value',
    });
  });

  it('should convert CSV patterns to arrays', () => {
    const input: DocumentAttributes = {
      keywords: 'test, simple, asciidoc',
      tags: 'single,',
      'normal-text': 'not a csv',
    };

    const result = normalizeAsciiDocAttributes(input);

    expect(result).toEqual({
      keywords: ['test', 'simple', 'asciidoc'],
      tags: ['single'],
      normalText: 'not a csv',
    });
  });

  it('should convert dash-case and snake_case keys to camelCase', () => {
    const input: DocumentAttributes = {
      'user-name': 'john',
      'api_key': '12345',
      'source-highlighter': 'shiki',
      normal: 'unchanged',
    };

    const result = normalizeAsciiDocAttributes(input);

    expect(result).toEqual({
      userName: 'john',
      apiKey: '12345',
      sourceHighlighter: 'shiki',
      normal: 'unchanged',
    });
  });

  it('should handle complex attribute combinations', () => {
    const input: DocumentAttributes = {
      'empty-boolean': '',
      'csv-list': 'one, two, three',
      'mixed_case-attr': 'value',
      number: 42,
      boolean: true,
    };

    const result = normalizeAsciiDocAttributes(input);

    expect(result).toEqual({
      emptyBoolean: true,
      csvList: ['one', 'two', 'three'],
      mixedCaseAttr: 'value',
      number: 42,
      boolean: true,
    });
  });

  it('should handle edge cases', () => {
    const input: DocumentAttributes = {
      'empty-object': {},
      'null-value': null,
      'undefined-value': undefined,
      'zero-number': 0,
      'false-boolean': false,
      'array-value': ['already', 'array'],
    };

    const result = normalizeAsciiDocAttributes(input);

    expect(result).toEqual({
      emptyObject: {},
      nullValue: null,
      undefinedValue: undefined,
      zeroNumber: 0,
      falseBoolean: false,
      arrayValue: ['already', 'array'],
    });
  });

  it('should handle CSV pattern matching edge cases', () => {
    const input: DocumentAttributes = {
      'single-trailing-comma': 'value,',
      'multiple-spaces': 'one,   two,   three',  
      'no-spaces': 'one,two,three', // Should NOT match CSV pattern
      'mixed-format': 'normal text, not csv',
    };

    const result = normalizeAsciiDocAttributes(input);

    expect(result).toEqual({
      singleTrailingComma: ['value'],
      multipleSpaces: ['one', 'two', 'three'],
      noSpaces: 'one,two,three', // Should remain as string
      mixedFormat: 'normal text, not csv', // Should remain as string
    });
  });

  it('should preserve values that are not strings or empty strings', () => {
    const input: DocumentAttributes = {
      'number-attr': 42,
      'boolean-attr': true,
      'object-attr': { nested: 'value' },
      'array-attr': ['item1', 'item2'],
    };

    const result = normalizeAsciiDocAttributes(input);

    expect(result).toEqual({
      numberAttr: 42,
      booleanAttr: true,
      objectAttr: { nested: 'value' },
      arrayAttr: ['item1', 'item2'],
    });
  });
});
