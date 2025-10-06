import {
  executeIf,
  executeIfElse,
  executeUnless,
  throwIf,
  throwUnless,
  createMarkdocFunction,
  range,
  iterate,
  syncIterate,
  iterateRange,
  returnErrorAndResultFromPromise,
} from '../index';

describe('Utilities - Core Functions', () => {
  describe('executeIf', () => {
    it('should execute callback when condition is truthy', () => {
      const mockFn = vi.fn(() => 'executed');
      const result = executeIf(true, mockFn);
      
      expect(mockFn).toHaveBeenCalledOnce();
      expect(result).toBe('executed');
    });

    it('should not execute callback when condition is falsy', () => {
      const mockFn = vi.fn(() => 'executed');
      const result = executeIf(false, mockFn);
      
      expect(mockFn).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should handle truthy conditions like non-empty strings', () => {
      const mockFn = vi.fn(() => 'executed');
      const result = executeIf('test', mockFn);
      
      expect(mockFn).toHaveBeenCalledOnce();
      expect(result).toBe('executed');
    });
  });

  describe('executeIfElse', () => {
    it('should execute ifCb when condition is true (object syntax)', () => {
      const ifFn = vi.fn(() => 'if executed');
      const elseFn = vi.fn(() => 'else executed');
      
      const result = executeIfElse({
        condition: true,
        ifCb: ifFn,
        elseCb: elseFn,
      });
      
      expect(ifFn).toHaveBeenCalledOnce();
      expect(elseFn).not.toHaveBeenCalled();
      expect(result).toBe('if executed');
    });

    it('should execute elseCb when condition is false (object syntax)', () => {
      const ifFn = vi.fn(() => 'if executed');
      const elseFn = vi.fn(() => 'else executed');
      
      const result = executeIfElse({
        condition: false,
        ifCb: ifFn,
        elseCb: elseFn,
      });
      
      expect(ifFn).not.toHaveBeenCalled();
      expect(elseFn).toHaveBeenCalledOnce();
      expect(result).toBe('else executed');
    });

    it('should execute ifCb when condition is true (parameter syntax)', () => {
      const ifFn = vi.fn(() => 'if executed');
      const elseFn = vi.fn(() => 'else executed');
      
      const result = executeIfElse(true, ifFn, elseFn);
      
      expect(ifFn).toHaveBeenCalledOnce();
      expect(elseFn).not.toHaveBeenCalled();
      expect(result).toBe('if executed');
    });

    it('should execute elseCb when condition is false (parameter syntax)', () => {
      const ifFn = vi.fn(() => 'if executed');
      const elseFn = vi.fn(() => 'else executed');
      
      const result = executeIfElse(false, ifFn, elseFn);
      
      expect(ifFn).not.toHaveBeenCalled();
      expect(elseFn).toHaveBeenCalledOnce();
      expect(result).toBe('else executed');
    });
  });

  describe('executeUnless', () => {
    it('should execute callback when condition is false', () => {
      const mockFn = vi.fn();
      
      executeUnless(false, mockFn);
      
      expect(mockFn).toHaveBeenCalledOnce();
    });

    it('should not execute callback when condition is true', () => {
      const mockFn = vi.fn();
      
      expect(() => executeUnless(true, mockFn)).not.toThrow();
      expect(mockFn).not.toHaveBeenCalled();
    });
  });

  describe('throwIf', () => {
    it('should throw error when condition is truthy', () => {
      expect(() => throwIf(true, 'Custom error')).toThrow('Custom error');
    });

    it('should not throw when condition is falsy', () => {
      expect(() => throwIf(false, 'Custom error')).not.toThrow();
    });

    it('should use default message when none provided', () => {
      expect(() => throwIf(true)).toThrow('Condition is false');
    });
  });

  describe('throwUnless', () => {
    it('should throw error when condition is false', () => {
      expect(() => throwUnless(false, 'Custom error')).toThrow('Custom error');
    });

    it('should not throw when condition is true', () => {
      expect(() => throwUnless(true, 'Custom error')).not.toThrow();
    });

    it('should use default message when none provided', () => {
      expect(() => throwUnless(false)).toThrow('Condition is true');
    });
  });
});

describe('Utilities - Markdoc Functions', () => {
  describe('createMarkdocFunction', () => {
    it('should create a function that can transform parameters', () => {
      const mockCallback = vi.fn((a: number, b: string) => `${a}-${b}`);
      const markdocFn = createMarkdocFunction(mockCallback);
      
      const result = markdocFn.transform({ 0: 42, 1: 'test' });
      
      expect(mockCallback).toHaveBeenCalledWith(42, 'test');
      expect(result).toBe('42-test');
    });

    it('should handle empty parameters', () => {
      const mockCallback = vi.fn(() => 'default');
      const markdocFn = createMarkdocFunction(mockCallback);
      
      const result = markdocFn.transform({});
      
      expect(mockCallback).toHaveBeenCalledWith();
      expect(result).toBe('default');
    });
  });
});

describe('Utilities - Range and Iteration', () => {
  describe('range', () => {
    it('should generate ascending range', () => {
      const result = Array.from(range(1, 5));
      expect(result).toEqual([1, 2, 3, 4]);
    });

    it('should generate descending range', () => {
      const result = Array.from(range(5, 1));
      expect(result).toEqual([5, 4, 3, 2]);
    });

    it('should generate inclusive range', () => {
      const result = Array.from(range(1, 3, { inclusive: true }));
      expect(result).toEqual([1, 2, 3]);
    });

    it('should generate range with custom step', () => {
      const result = Array.from(range(0, 10, { step: 2 }));
      expect(result).toEqual([0, 2, 4, 6, 8]);
    });

    it('should throw error when start equals stop', () => {
      expect(() => Array.from(range(5, 5))).toThrow("Start can't be the same as stop");
    });

    it('should throw error when step is zero or negative', () => {
      expect(() => Array.from(range(1, 5, { step: 0 }))).toThrow("Step can't be zero or a negative number");
      expect(() => Array.from(range(1, 5, { step: -1 }))).toThrow("Step can't be zero or a negative number");
    });
  });

  describe('syncIterate', () => {
    it('should iterate over array synchronously', () => {
      const arr = [1, 2, 3];
      const mockFn = vi.fn((val, info, key) => `${key}:${val}`);
      
      const result = Array.from(syncIterate(arr, mockFn));
      
      expect(result).toHaveLength(3);
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should iterate over generator synchronously', () => {
      function* gen() {
        yield 1;
        yield 2;
        yield 3;
      }
      
      const mockFn = vi.fn((val) => val * 2);
      const result = Array.from(syncIterate(gen(), mockFn));
      
      expect(result).toEqual([2, 4, 6]);
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should throw error for non-iterable', () => {
      expect(() => Array.from(syncIterate(null as any, vi.fn()))).toThrow('You did not pass in an iterable');
    });
  });
});

describe('Utilities - Async Operations', () => {
  describe('returnErrorAndResultFromPromise', () => {
    it('should return result and null error for successful promise', async () => {
      const successPromise = Promise.resolve('success');
      const [result, error] = await returnErrorAndResultFromPromise(successPromise);
      
      expect(result).toBe('success');
      expect(error).toBeNull();
    });

    it('should return null result and Error for rejected promise with Error', async () => {
      const errorPromise = Promise.reject(new Error('Test error'));
      const [result, error] = await returnErrorAndResultFromPromise(errorPromise);
      
      expect(result).toBeNull();
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe('Test error');
    });

    it('should return null result and Error for rejected promise with string', async () => {
      const errorPromise = Promise.reject('String error');
      const [result, error] = await returnErrorAndResultFromPromise(errorPromise);
      
      expect(result).toBeNull();
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe('String error');
    });

    it('should return null result and Error for rejected promise with object', async () => {
      const errorObj = { code: 500, message: 'Server error' };
      const errorPromise = Promise.reject(errorObj);
      const [result, error] = await returnErrorAndResultFromPromise(errorPromise);
      
      expect(result).toBeNull();
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe(JSON.stringify(errorObj, null, 2));
    });

    it('should return null result and generic Error for unknown rejection', async () => {
      const errorPromise = Promise.reject(42);
      const [result, error] = await returnErrorAndResultFromPromise(errorPromise);
      
      expect(result).toBeNull();
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe('Something went wrong');
    });
  });

  describe('iterate (async)', () => {
    it('should iterate over array asynchronously', async () => {
      const arr = [1, 2, 3];
      const mockFn = vi.fn(async (val, info, key) => `${key}:${val}`);
      
      const results = [];
      for await (const item of iterate(arr, mockFn)) {
        results.push(item);
      }
      
      expect(results).toHaveLength(3);
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should iterate over generator asynchronously', async () => {
      function* gen() {
        yield 1;
        yield 2;
        yield 3;
      }
      
      const mockFn = vi.fn(async (val) => val * 2);
      const results = [];
      
      for await (const item of iterate(gen(), mockFn)) {
        results.push(item);
      }
      
      expect(results).toEqual([2, 4, 6]);
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should throw error for non-iterable', () => {
      await expect(async () => {
        for await (const item of iterate(null as any, vi.fn())) {
          // This shouldn't be reached
        }
      }).rejects.toThrow('You did not pass in an iterable');
    });
  });

  describe('iterateRange', () => {
    it('should iterate over range asynchronously', async () => {
      const mockFn = vi.fn(async (val, info) => val * 2);
      const results = [];
      
      for await (const item of iterateRange(mockFn, { start: 1, stop: 4 })) {
        results.push(item);
      }
      
      expect(results).toEqual([2, 4, 6]);
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should iterate over inclusive range', async () => {
      const mockFn = vi.fn(async (val) => val);
      const results = [];
      
      for await (const item of iterateRange(mockFn, { 
        start: 1, 
        stop: 3, 
        inclusive: true 
      })) {
        results.push(item);
      }
      
      expect(results).toEqual([1, 2, 3]);
      expect(mockFn).toHaveBeenCalledTimes(3);
    });
  });
});
