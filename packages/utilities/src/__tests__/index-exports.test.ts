import { describe, it, expect } from 'vitest';
import * as UtilitiesIndex from '../index';
import { useTemplaterAndProjector } from '../lib/useTemplaterAndProjector';

describe('Index exports', () => {
  describe('function exports', () => {
    const expectedFunctions = [
      'executeIf',
      'executeIfElse',
      'executeUnless',
      'throwIf',
      'throwUnless',
      'createMarkdocFunction',
      'range',
      'iterate',
      'syncIterate',
      'iterateRange',
      'returnErrorAndResultFromPromise',
    ];

    expectedFunctions.forEach((functionName) => {
      it(`should export ${functionName} as a function`, () => {
        expect(typeof UtilitiesIndex[functionName]).toBe('function');
      });
    });
  });

  describe('re-exports from lib', () => {
    it('should export useTemplaterAndProjector from lib/useTemplaterAndProjector', () => {
      expect(typeof UtilitiesIndex.useTemplaterAndProjector).toBe('function');
      expect(UtilitiesIndex.useTemplaterAndProjector).toBe(useTemplaterAndProjector);
    });
  });

  describe('all exports verification', () => {
    it('should have expected number of exports', () => {
      const exportNames = Object.keys(UtilitiesIndex);
      // Expected: 11 functions + 1 re-export = 12 total
      expect(exportNames.length).toBe(12);
    });

    it('should not export any undefined values', () => {
      const exportNames = Object.keys(UtilitiesIndex);
      exportNames.forEach((exportName) => {
        expect(UtilitiesIndex[exportName]).toBeDefined();
      });
    });
  });

  describe('function signatures validation', () => {
    it('should export executeIf with correct signature', () => {
      const result = UtilitiesIndex.executeIf(true, () => 'test');
      expect(result).toBe('test');
    });

    it('should export range generator function', () => {
      const rangeResult = Array.from(UtilitiesIndex.range(1, 4));
      expect(rangeResult).toEqual([1, 2, 3]);
    });

    it('should export createMarkdocFunction that returns transform object', () => {
      const markdocFn = UtilitiesIndex.createMarkdocFunction(() => 'test');
      expect(markdocFn).toHaveProperty('transform');
      expect(typeof markdocFn.transform).toBe('function');
    });

    it('should export async functions properly', async () => {
      const promise = Promise.resolve('success');
      const [result, error] = await UtilitiesIndex.returnErrorAndResultFromPromise(promise);
      expect(result).toBe('success');
      expect(error).toBeNull();
    });

    it('should export generator functions properly', async () => {
      const results = [];
      for await (const item of UtilitiesIndex.iterate([1, 2, 3], (val) => val * 2)) {
        results.push(item);
      }
      expect(results).toEqual([2, 4, 6]);
    });
  });

  describe('error handling functions', () => {
    it('should export throwIf that throws on truthy conditions', () => {
      expect(() => UtilitiesIndex.throwIf(true, 'test error')).toThrow('test error');
      expect(() => UtilitiesIndex.throwIf(false, 'test error')).not.toThrow();
    });

    it('should export throwUnless that throws on falsy conditions', () => {
      expect(() => UtilitiesIndex.throwUnless(false, 'test error')).toThrow('test error');
      expect(() => UtilitiesIndex.throwUnless(true, 'test error')).not.toThrow();
    });
  });

  describe('conditional execution functions', () => {
    it('should export executeUnless that executes on falsy conditions', () => {
      const mockFn = vi.fn();
      UtilitiesIndex.executeUnless(false, mockFn);
      expect(mockFn).toHaveBeenCalled();
    });

    it('should export executeIfElse with both syntax forms', () => {
      const result1 = UtilitiesIndex.executeIfElse(true, () => 'if', () => 'else');
      expect(result1).toBe('if');

      const result2 = UtilitiesIndex.executeIfElse({
        condition: false,
        ifCb: () => 'if',
        elseCb: () => 'else',
      });
      expect(result2).toBe('else');
    });
  });

  describe('iteration functions', () => {
    it('should export syncIterate for synchronous iteration', () => {
      const results = Array.from(UtilitiesIndex.syncIterate([1, 2, 3], (val) => val * 2));
      expect(results).toEqual([2, 4, 6]);
    });

    it('should export syncIterate with generators', () => {
      function* gen() {
        yield 1;
        yield 2;
      }
      const results = Array.from(UtilitiesIndex.syncIterate(gen(), (val) => val * 2));
      expect(results).toEqual([2, 4]);
    });

    it('should export iterateRange for range iteration', async () => {
      const results = [];
      for await (const item of UtilitiesIndex.iterateRange(
        (val) => val * 2,
        { start: 1, stop: 4 }
      )) {
        results.push(item);
      }
      expect(results).toEqual([2, 4, 6]);
    });

    it('should handle async iterate with generators', async () => {
      function* gen() {
        yield 10;
        yield 20;
      }
      const results = [];
      for await (const item of UtilitiesIndex.iterate(gen(), (val) => val / 2)) {
        results.push(item);
      }
      expect(results).toEqual([5, 10]);
    });
  });

  describe('range function edge cases', () => {
    it('should handle descending range with inclusive option', () => {
      const result = Array.from(UtilitiesIndex.range(10, 5, { inclusive: true }));
      expect(result).toEqual([10, 9, 8, 7, 6, 5]);
    });

    it('should handle ascending range with inclusive option', () => {
      const result = Array.from(UtilitiesIndex.range(1, 5, { inclusive: true }));
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle custom step in descending range', () => {
      const result = Array.from(UtilitiesIndex.range(10, 2, { step: 2 }));
      expect(result).toEqual([10, 8, 6, 4]);
    });
  });

  describe('createMarkdocFunction edge cases', () => {
    it('should handle callback with no parameters', () => {
      const callback = vi.fn(() => 'no-params');
      const markdocFn = UtilitiesIndex.createMarkdocFunction(callback);
      
      const result = markdocFn.transform({});
      
      expect(callback).toHaveBeenCalledWith();
      expect(result).toBe('no-params');
    });

    it('should handle callback with many parameters', () => {
      const callback = vi.fn((...args: unknown[]) => args.join('-'));
      const markdocFn = UtilitiesIndex.createMarkdocFunction(callback);
      
      const result = markdocFn.transform({ 0: 'a', 1: 'b', 2: 'c', 3: 'd' });
      
      expect(callback).toHaveBeenCalledWith('a', 'b', 'c', 'd');
      expect(result).toBe('a-b-c-d');
    });
  });

  describe('error handling edge cases', () => {
    it('should handle different error types in returnErrorAndResultFromPromise', async () => {
      // Test object error
      const objectError = { code: 500, message: 'Server error' };
      const [result1, error1] = await UtilitiesIndex.returnErrorAndResultFromPromise(
        Promise.reject(objectError)
      );
      expect(result1).toBeNull();
      expect(error1?.message).toBe(JSON.stringify(objectError, null, 2));
      
      // Test unknown error type (number)
      const [result2, error2] = await UtilitiesIndex.returnErrorAndResultFromPromise(
        Promise.reject(123)
      );
      expect(result2).toBeNull();
      expect(error2?.message).toBe('Something went wrong');
    });
  });
});
