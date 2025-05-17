// src/main.tsx
import { BrowserRouter } from "react-router-dom";
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/providers/theme"
import { WalletProvider } from "@/components/providers/wallet"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"

// Get the saved theme preference from localStorage
const getThemePreference = () => {
  const theme = localStorage.getItem("vite-ui-theme");
  if (theme === "dark" || theme === "light") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

// Apply theme class to document before rendering to prevent flash
document.documentElement.classList.add(getThemePreference());
document.body.classList.add(getThemePreference());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default settings that will apply to all queries unless overridden
      staleTime: 5 * 60 * 1000,      // 5 minutes by default
      gcTime: 60 * 60 * 1000,        // 1 hour
      refetchInterval: false,        // No automatic refetching by default
      refetchIntervalInBackground: false,
      retry: 1,
    },
  },
});

// Prepare the application environment
async function prepare() {
  // Check if we're in a development environment
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    return worker.start({
      onUnhandledRequest: 'bypass',
    });
  }

  // Only enable MSW in production if explicitly configured
  if (import.meta.env.VITE_ENABLE_MSW === 'true') {
    try {
      console.log('MSW base path:', import.meta.env.BASE_URL);
      const { startMSW } = await import('./mocks/browser');
      return startMSW({
        serviceWorkerUrl: `${import.meta.env.BASE_URL}mockServiceWorker.js`
      }).catch(error => {
        console.warn('MSW initialization failed, continuing without mocks:', error);
        return Promise.resolve();
      });
    } catch (error) {
      console.warn('MSW import failed, continuing without mocks:', error);
      return Promise.resolve();
    }
  }

  // Skip MSW in all other cases (including preview)
  console.log('Skipping MSW initialization');
  return Promise.resolve();
}

// Initialize the environment, then render the app
prepare().then(() => {
  const basename = import.meta.env.BASE_URL || "/";
  createRoot(document.getElementById("root")!).render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <WalletProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter basename={basename}>
                <App />
              </BrowserRouter>
            </TooltipProvider>
          </WalletProvider>
        </ThemeProvider>
      </QueryClientProvider>
  );
});