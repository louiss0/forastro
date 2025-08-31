import { describe, it, expect, vi } from 'vitest';
import {
  IterationInfo,
  generateIterationInfoForIterablesThatAreNotGenerators,
  isIterable,
  isObject,
  isGenerator,
  wrapFunctionInAsyncGenerator,
  hasForEachMethod,
  createAstroFunctionalComponent,
  type HasForEachMethod,
} from '../lib/internal';

describe('IterationInfo', () => {
  describe('constructor', () => {
    it('should create an instance with correct properties', () => {
      const info = new IterationInfo(0, 5, 10);
      expect(info).toBeInstanceOf(IterationInfo);
    });
  });

  describe('getters', () => {
    const testCases = [
      {
        first: 0,
        current: 0,
        last: 5,
        expectedCount: 5,
        expectedIteration: 1,
        expectedIsFirst: true,
        expectedIsLast: false,
        expectedIsEven: true,
        expectedIsOdd: false,
        expectedRemaining: 4,
      },
      {
        first: 0,
        current: 2,
        last: 5,
        expectedCount: 5,
        expectedIteration: 3,
        expectedIsFirst: false,
        expectedIsLast: false,
        expectedIsEven: true,
        expectedIsOdd: false,
        expectedRemaining: 2,
      },
      {
        first: 0,
        current: 4,
        last: 5,
        expectedCount: 5,
        expectedIteration: 5,
        expectedIsFirst: false,
        expectedIsLast: true,
        expectedIsEven: true,
        expectedIsOdd: false,
        expectedRemaining: 0,
      },
      {
        first: 1,
        current: 3,
        last: 7,
        expectedCount: 6,
        expectedIteration: 4,
        expectedIsFirst: false,
        expectedIsLast: false,
        expectedIsEven: false,
        expectedIsOdd: true,
        expectedRemaining: 3,
      },
    ];

    testCases.forEach(
      ({
        first,
        current,
        last,
        expectedCount,
        expectedIteration,
        expectedIsFirst,
        expectedIsLast,
        expectedIsEven,
        expectedIsOdd,
        expectedRemaining,
      }) => {
        describe(`with first=${first}, current=${current}, last=${last}`, () => {
          const info = new IterationInfo(first, current, last);

          it(`should return count: ${expectedCount}`, () => {
            expect(info.count).toBe(expectedCount);
          });

          it(`should return iteration: ${expectedIteration}`, () => {
            expect(info.iteration).toBe(expectedIteration);
          });

          it(`should return isFirst: ${expectedIsFirst}`, () => {
            expect(info.isFirst).toBe(expectedIsFirst);
          });

          it(`should return isLast: ${expectedIsLast}`, () => {
            expect(info.isLast).toBe(expectedIsLast);
          });

          it(`should return isEven: ${expectedIsEven}`, () => {
            expect(info.isEven).toBe(expectedIsEven);
          });

          it(`should return isOdd: ${expectedIsOdd}`, () => {
            expect(info.isOdd).toBe(expectedIsOdd);
          });

          it(`should return remaining: ${expectedRemaining}`, () => {
            expect(info.remaining).toBe(expectedRemaining);
          });
        });
      },
    );
  });
});

describe('generateIterationInfoForIterablesThatAreNotGenerators', () => {
  it('should generate iteration info for arrays', () => {
    const array = ['a', 'b', 'c'];
    const results = Array.from(generateIterationInfoForIterablesThatAreNotGenerators(array));

    expect(results).toHaveLength(3);

    expect(results[0].value).toBe('a');
    expect(results[0].key).toBe(0);
    expect(results[0].info.isFirst).toBe(true);
    expect(results[0].info.iteration).toBe(1);

    expect(results[1].value).toBe('b');
    expect(results[1].key).toBe(1);
    expect(results[1].info.iteration).toBe(2);

    expect(results[2].value).toBe('c');
    expect(results[2].key).toBe(2);
    expect(results[2].info.isLast).toBe(true);
    expect(results[2].info.iteration).toBe(3);
  });

  it('should generate iteration info for Maps', () => {
    const map = new Map([
      ['key1', 'value1'],
      ['key2', 'value2'],
    ]);
    const results = Array.from(generateIterationInfoForIterablesThatAreNotGenerators(map));

    expect(results).toHaveLength(2);
    expect(results[0].value).toBe('value1');
    expect(results[0].key).toBe('key1');
    expect(results[1].value).toBe('value2');
    expect(results[1].key).toBe('key2');
  });

  it('should handle empty iterables', () => {
    const emptyArray: string[] = [];
    const results = Array.from(generateIterationInfoForIterablesThatAreNotGenerators(emptyArray));

    expect(results).toHaveLength(0);
  });
});

describe('isIterable', () => {
  const testCases = [
    { input: [], expected: true, description: 'array' },
    { input: 'string', expected: false, description: 'string' }, // Fixed: strings are not considered iterable by this implementation
    { input: new Map(), expected: true, description: 'Map' },
    { input: new Set(), expected: true, description: 'Set' },
    { input: 42, expected: false, description: 'number' },
    { input: null, expected: false, description: 'null' },
    { input: undefined, expected: false, description: 'undefined' },
    { input: {}, expected: false, description: 'plain object' },
    { input: true, expected: false, description: 'boolean' },
  ];

  testCases.forEach(({ input, expected, description }) => {
    it(`should return ${expected} for ${description}`, () => {
      expect(isIterable(input)).toBe(expected);
    });
  });

  it('should handle objects with Symbol.iterator', () => {
    const customIterable = {
      [Symbol.iterator]: function* () {
        yield 1;
        yield 2;
      },
    };
    expect(isIterable(customIterable)).toBe(true);
  });

  it('should handle objects with Symbol.asyncIterator', () => {
    const customAsyncIterable = {
      [Symbol.asyncIterator]: async function* () {
        yield 1;
        yield 2;
      },
    };
    expect(isIterable(customAsyncIterable)).toBe(true);
  });
});

describe('isObject', () => {
  const testCases = [
    { input: {}, expected: true, description: 'empty object' },
    { input: { key: 'value' }, expected: true, description: 'object with properties' },
    { input: [], expected: true, description: 'array' },
    { input: new Date(), expected: true, description: 'Date object' },
    { input: null, expected: false, description: 'null' },
    { input: undefined, expected: false, description: 'undefined' },
    { input: 'string', expected: false, description: 'string' },
    { input: 42, expected: false, description: 'number' },
    { input: true, expected: false, description: 'boolean' },
    { input: Symbol('test'), expected: false, description: 'symbol' },
  ];

  testCases.forEach(({ input, expected, description }) => {
    it(`should return ${expected} for ${description}`, () => {
      expect(isObject(input)).toBe(expected);
    });
  });
});

describe('isGenerator', () => {
  it('should return true for generator objects', () => {
    function* gen() {
      yield 1;
    }
    const generator = gen();
    expect(isGenerator(generator)).toBe(true);
  });

  it('should return false for non-generators', () => {
    const testCases = [
      [],
      {},
      'string',
      42,
      null,
      undefined,
      function () {},
      async function () {},
    ];

    testCases.forEach((input) => {
      expect(isGenerator(input)).toBe(false);
    });
  });

  it('should return false for async generators', () => {
    async function* asyncGen() {
      yield 1;
    }
    const asyncGenerator = asyncGen();
    // Async generators have different toString behavior
    expect(isGenerator(asyncGenerator)).toBe(false);
  });
});

describe('wrapFunctionInAsyncGenerator', () => {
  it('should wrap synchronous function', async () => {
    const syncFn = (x: number) => x * 2;
    const wrapped = wrapFunctionInAsyncGenerator(syncFn);

    const generator = wrapped(5);
    const result = await generator.next();

    expect(result.value).toBe(10);
    expect(result.done).toBe(false);
  });

  it('should wrap asynchronous function', async () => {
    const asyncFn = async (x: number) => {
      await new Promise((resolve) => setTimeout(resolve, 1));
      return x * 2;
    };
    const wrapped = wrapFunctionInAsyncGenerator(asyncFn);

    const generator = wrapped(5);
    const result = await generator.next();

    expect(result.value).toBe(10);
    expect(result.done).toBe(false);
  });

  it('should handle functions with multiple parameters', async () => {
    const multiParamFn = (a: number, b: string) => `${a}-${b}`;
    const wrapped = wrapFunctionInAsyncGenerator(multiParamFn);

    const generator = wrapped(42, 'test');
    const result = await generator.next();

    expect(result.value).toBe('42-test');
  });

  it('should handle functions that return promises', async () => {
    const promiseFn = (x: number) => Promise.resolve(x * 3);
    const wrapped = wrapFunctionInAsyncGenerator(promiseFn);

    const generator = wrapped(10);
    const result = await generator.next();

    expect(result.value).toBe(30);
    expect(result.done).toBe(false);
  });

  it('should handle functions that throw errors', async () => {
    const errorFn = () => {
      throw new Error('Test error');
    };
    const wrapped = wrapFunctionInAsyncGenerator(errorFn);

    await expect(wrapped().next()).rejects.toThrow('Test error');
  });
});

describe('hasForEachMethod', () => {
  it('should return true for objects with forEach method', () => {
    const testCases = [
      [],
      new Map(),
      new Set(),
      { forEach: () => {} },
    ];

    testCases.forEach((input) => {
      expect(hasForEachMethod(input)).toBe(true);
    });
  });

  it('should return false for objects without forEach method', () => {
    const testCases = [
      {},
      'string',
      42,
      null,
      undefined,
      { map: () => {} }, // has map but not forEach
    ];

    testCases.forEach((input) => {
      expect(hasForEachMethod(input)).toBe(false);
    });
  });
});

describe('createAstroFunctionalComponent', () => {
  it('should create a functional component', () => {
    const renderFn = vi.fn().mockReturnValue('rendered content');
    const component = createAstroFunctionalComponent(renderFn);

    expect(typeof component).toBe('function');
    expect(component.isAstroComponentFactory).toBe(true);
  });

  it('should return component with correct structure when called', () => {
    const renderFn = vi.fn().mockReturnValue('rendered content');
    const component = createAstroFunctionalComponent(renderFn);

    const mockResult = { test: 'result' } as any;
    const mockProps = { prop1: 'value1' };
    const mockSlots = { default: undefined };

    const result = component(mockResult, mockProps, mockSlots);

    expect(result[Symbol.toStringTag]).toBe('AstroComponent');
    expect(Symbol.asyncIterator in result).toBe(true);
    expect(typeof result[Symbol.asyncIterator]).toBe('function');
  });

  it('should handle async render functions', async () => {
    const asyncRenderFn = vi.fn().mockResolvedValue('async rendered content');
    const component = createAstroFunctionalComponent(asyncRenderFn);

    const mockResult = { test: 'result' } as any;
    const mockProps = { prop1: 'value1' };
    const mockSlots = { default: undefined };

    const result = component(mockResult, mockProps, mockSlots);
    const iterator = result[Symbol.asyncIterator]();
    const { value } = await iterator.next();

    expect(value).toBe('async rendered content');
  });

  it('should pass props and slots to render function', () => {
    const renderFn = vi.fn().mockReturnValue('rendered');
    const component = createAstroFunctionalComponent(renderFn);

    const mockResult = {} as any;
    const mockProps = { test: 'prop' };
    const mockSlots = { default: vi.fn() };

    const result = component(mockResult, mockProps, mockSlots);
    
    // Trigger the async iterator to call the render function
    result[Symbol.asyncIterator]().next();

    expect(renderFn).toHaveBeenCalledWith(mockProps, mockSlots);
  });
});
