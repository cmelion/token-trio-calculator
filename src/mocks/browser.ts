// src/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

// Only start MSW if enabled via environment variable
export const startMSW = async () => {
    // Check for environment variable that enables mocking in production
    if (import.meta.env.VITE_ENABLE_MSW === 'true') {
        console.log('MSW initialized in production')
        await worker.start({
            onUnhandledRequest: 'bypass', // Don't warn on unhandled requests
        })
    }
}