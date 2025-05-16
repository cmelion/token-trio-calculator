// .storybook/preview.ts
import type { Preview } from '@storybook/react';
import '../src/index.css';
import { worker } from '../src/mocks/browser';

// Initialize MSW for Storybook
const initMSW = async () => {
    if (typeof window !== 'undefined') {
        // Start MSW with correct service worker path
        return worker.start({
            serviceWorker: {
                url: './mockServiceWorker.js',
            },
            onUnhandledRequest: 'bypass',
        }).then(() => {
            console.log('MSW initialized in Storybook');
        });
    }
    return Promise.resolve();
};

// Start MSW before any stories load
initMSW().catch(error => console.error('Failed to start MSW:', error));

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;