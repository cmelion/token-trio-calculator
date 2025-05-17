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
      staleTime: 0,           // Data is considered stale immediately
      refetchInterval: 10000, // Refetch every 10 seconds by default to keep volatile data current
      refetchIntervalInBackground: true,
      retry: 1,
    },
  },
});

// Prepare the application environment
async function prepare() {
  // MSW setup code remains unchanged
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    return worker.start({
      onUnhandledRequest: 'bypass',
    });
  } else if (import.meta.env.VITE_ENABLE_MSW === 'true') {
    const { startMSW } = await import('./mocks/browser');
    return startMSW();
  }
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