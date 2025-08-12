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
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'info').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

// Clean up mocks after tests
afterEach(() => {
  vi.clearAllMocks();
});
