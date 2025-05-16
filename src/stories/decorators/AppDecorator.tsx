// src/stories/decorators/AppDecoratorWithoutRouter.tsx
import { useEffect } from "react"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider } from "@/components/providers/theme/"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { WalletProvider } from "@/components/providers/wallet"

const queryClient = new QueryClient()

interface StorybookAppDecoratorProps {
    children: React.ReactNode
}

const getThemePreference = () => {
    const theme = localStorage.getItem("vite-ui-theme")
    if (theme === "dark" || theme === "light") return theme
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export const StorybookAppDecorator: React.FC<StorybookAppDecoratorProps> = ({
                                                                                children,
                                                                            }) => {
    useEffect(() => {
        const theme = getThemePreference()
        document.documentElement.classList.add(theme)
        document.body.classList.add(theme)

        return () => {
            document.documentElement.classList.remove("dark", "light")
            document.body.classList.remove("dark", "light")
        }
    }, [])

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <WalletProvider>
                    <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        <MemoryRouter initialEntries={["/"]}>
                            {children}
                        </MemoryRouter>
                    </TooltipProvider>
                </WalletProvider>
            </ThemeProvider>
        </QueryClientProvider>
    )
}