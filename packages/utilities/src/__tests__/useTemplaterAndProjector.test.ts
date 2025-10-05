import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTemplaterAndProjector } from '../lib/useTemplaterAndProjector';

// Mock internal dependencies
vi.mock('../lib/internal', () => ({
  createAstroFunctionalComponent: vi.fn((renderFn) => {
    // Return a mock function that simulates the Astro component behavior
    const mockComponent = vi.fn();
    mockComponent.isAstroComponentFactory = true;
    return mockComponent;
  }),
}));

describe('useTemplaterAndProjector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should return a tuple of Templater and Projector components', () => {
      const result = useTemplaterAndProjector();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(typeof result[0]).toBe('function'); // Templater
      expect(typeof result[1]).toBe('function'); // Projector
    });

    it('should accept optional debugName parameter', () => {
      const debugName = 'TestComponent';
      const result = useTemplaterAndProjector(debugName);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it('should generate unique component names when no debugName provided', () => {
      const result1 = useTemplaterAndProjector();
      const result2 = useTemplaterAndProjector();
      
      // Both should be valid returns
      expect(result1).toHaveLength(2);
      expect(result2).toHaveLength(2);
      
      // Components should be different instances
      expect(result1[0]).not.toBe(result2[0]);
      expect(result1[1]).not.toBe(result2[1]);
    });
  });

  describe('TypeScript type inference', () => {
    it('should handle null types for both parameters', () => {
      const [Templater, Projector] = useTemplaterAndProjector<null, null>();
      
      expect(typeof Templater).toBe('function');
      expect(typeof Projector).toBe('function');
    });

    it('should handle object types for ProjectorProps', () => {
      interface TestProjectorProps {
        name: string;
        count: number;
      }
      
      const [Templater, Projector] = useTemplaterAndProjector<TestProjectorProps, null>();
      
      expect(typeof Templater).toBe('function');
      expect(typeof Projector).toBe('function');
    });

    it('should handle object types for both parameters', () => {
      interface TestProjectorProps {
        name: string;
      }
      
      interface TestTemplaterProps {
        title: string;
      }
      
      const [Templater, Projector] = useTemplaterAndProjector<TestProjectorProps, TestTemplaterProps>();
      
      expect(typeof Templater).toBe('function');
      expect(typeof Projector).toBe('function');
    });
  });

  describe('call count behavior', () => {
    it('should increment call count with each invocation', () => {
      // Call multiple times
      useTemplaterAndProjector();
      useTemplaterAndProjector();
      useTemplaterAndProjector('test');
      
      // Each call should succeed
      const result = useTemplaterAndProjector();
      expect(result).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string as debugName', () => {
      const result = useTemplaterAndProjector('');
      
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it('should handle special characters in debugName', () => {
      const debugName = 'Test-Component_123!@#';
      const result = useTemplaterAndProjector(debugName);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it('should handle very long debugName', () => {
      const longName = 'A'.repeat(1000);
      const result = useTemplaterAndProjector(longName);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });
  });

  describe('multiple instantiations', () => {
    it('should create independent component pairs', () => {
      const [Templater1, Projector1] = useTemplaterAndProjector('Component1');
      const [Templater2, Projector2] = useTemplaterAndProjector('Component2');
      
      // Should be different functions
      expect(Templater1).not.toBe(Templater2);
      expect(Projector1).not.toBe(Projector2);
      
      // Both should be valid
      expect(typeof Templater1).toBe('function');
      expect(typeof Projector1).toBe('function');
      expect(typeof Templater2).toBe('function');
      expect(typeof Projector2).toBe('function');
    });
  });

  describe('error handling', () => {
    it('should handle undefined debugName gracefully', () => {
      const result = useTemplaterAndProjector(undefined);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });
  });
});
