// src/components/tests/setupTests.ts
import '@testing-library/jest-dom';
import { server } from './msw-server';
import { vi } from 'vitest';

// Mock implementation for window.matchMedia
// Mock implementation for window.matchMedia with theme preference detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: query.includes('prefers-color-scheme: dark'), // Will return true for dark mode queries
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  }),
});

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());