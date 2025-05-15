// src/main.tsx
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Get the saved theme preference from localStorage
const getThemePreference = () => {
  const theme = localStorage.getItem("vite-ui-theme");
  if (theme === "dark" || theme === "light") return theme;

  // Check system preference if no theme is saved
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

// Apply theme class to document before rendering to prevent flash
document.documentElement.classList.add(getThemePreference());
document.body.classList.add(getThemePreference());

// Prepare the application environment, including MSW in development or when enabled in production
async function prepare() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    return worker.start({
      onUnhandledRequest: 'bypass',
    });
  } else if (import.meta.env.VITE_ENABLE_MSW === 'true') {
    // Use the startMSW function in production when enabled
    const { startMSW } = await import('./mocks/browser');
    return startMSW();
  }
  return Promise.resolve();
}

// Initialize the environment, then render the app
prepare().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});