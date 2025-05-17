// src/mocks/browser.ts
import { handlers } from './handlers';
import { setupWorker } from 'msw/browser';

export const worker = setupWorker(...handlers)

// Start MSW with the provided service worker URL
export const startMSW = async ({ serviceWorkerUrl }: { serviceWorkerUrl: string }) => {
  // Check for environment variable that enables mocking in production
  if (import.meta.env.VITE_ENABLE_MSW === "true") {
    console.log("MSW initialized in production with service worker:", serviceWorkerUrl);
    await worker.start({
      serviceWorker: {
        url: serviceWorkerUrl,
      },
      onUnhandledRequest: "bypass", // Don't warn on unhandled requests
    });
    return true;
  }
  return false;
}