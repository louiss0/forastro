// Global setup for vitest
import { vi, afterEach } from 'vitest';

// Mock process.platform if needed in tests
// This allows tests to simulate different platforms
vi.mock('process', () => {
  return {
    ...process,
    platform: process.platform, // Can be overridden in tests
  };
});

// Mock console methods to prevent noise during tests
vi.spyOn(console, 'log').mockImplementation(() => void 0);
vi.spyOn(console, 'info').mockImplementation(() => void 0);
vi.spyOn(console, 'warn').mockImplementation(() => void 0);
vi.spyOn(console, 'error').mockImplementation(() => void 0);

// Clean up mocks after tests
afterEach(() => {
  vi.clearAllMocks();
});
