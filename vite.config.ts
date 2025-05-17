import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
    // Determine if we're building for GitHub Pages
    const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';
    const base = isGitHubPages ? '/token-trio-calculator/' : '/';

    return {
        base,
        server: {
            host: "::",
            port: 8080,
            hmr: {
                overlay: true,
            },
            watch: {
                usePolling: true,
            },
        },
        plugins: [
            react(),
            mode === 'development' && componentTagger(),
        ].filter(Boolean),
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
    };
});