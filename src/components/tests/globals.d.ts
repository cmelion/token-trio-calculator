// src/components/tests/globals.d.ts

// Add Vitest global functions
declare global {
  // Setup and teardown hooks
  const beforeAll: typeof vi.beforeAll;
  const afterAll: typeof vi.afterAll;
  const beforeEach: typeof vi.beforeEach;
  const afterEach: typeof vi.afterEach;

  // Test functions
  const describe: typeof vi.describe;
  const it: typeof vi.it;
  const test: typeof vi.test;
  const expect: typeof vi.expect;

  // Mock utilities
  const vi: typeof vi;
  const mock: typeof vi.mock;
  const spyOn: typeof vi.spyOn;
}

// This export is needed to make TypeScript treat this as a module
export {};