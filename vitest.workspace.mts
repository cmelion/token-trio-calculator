// vitest.workspace.mts
import { defineWorkspace } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import { quickpickle } from "quickpickle";
import * as path from 'path';

// Common configuration that will be shared/extended
const baseConfig = {
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tests": path.resolve(__dirname, "./tests"),
      // Mock the worker file for MSW
      "msw/browser": path.resolve(__dirname, "node_modules/msw/lib/browser/index.js"),
    },
  },
};

// Define the test configuration for the 'components' project
const componentsTestConfig = {
  name: 'components',
  environment: 'jsdom',
  globals: true,
  include: ['./src/**/*.feature', './src/App.feature', './src/components/**/*.test.{ts,tsx}'],
  // We have to use the index file to load all step definitions
  setupFiles: [
    'src/components/tests/setupTests.ts',
    'src/components/tests/index.ts'
  ],
  reporters: ['default', 'html'],
  outputFile: {
    html: './vitest-report/index.html'
  },
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    reportsDirectory: './coverage/components',
    // Only include src files in coverage reports
    include: ['src/**'],
    exclude: [
      'src/main.tsx',
      'src/mocks/browser.ts',
    ]
  },
};

export default defineWorkspace([
  {
    ...baseConfig,
    plugins: [...(baseConfig.plugins || []), quickpickle()],
    test: componentsTestConfig,
  },
]);