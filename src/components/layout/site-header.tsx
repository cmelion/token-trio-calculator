
import { MainNav } from "@/components/layout/main-nav.tsx"
import { ThemeToggle } from "@/components/providers/theme"
import { siteConfig } from "@/config/site.ts"
import { GithubIcon } from "lucide-react"
import { Icons } from "@/components/common/icons.tsx"
import { ConnectWalletButton } from "@/components/common/ConnectWalletButton.tsx"

export function SiteHeader() {
  return (
      <header className="sticky top-0 z-40 w-full border-b bg-background transition-colors duration-200 dark:bg-black/30 dark:backdrop-blur-lg dark:border-primary/20 light:bg-white/90 light:backdrop-blur-sm light:border-gray-200">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <MainNav items={siteConfig.mainNav} />
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-3">
              <ConnectWalletButton />
              <a
                  href="https://github.com/cmelion/token-trio-calculator"
                  target="_blank"
                  rel="noreferrer"
                  title="View source on GitHub"
                  aria-label="GitHub"
                  className="p-2 text-foreground/70 transition-colors hover:text-foreground dark:text-white/70 dark:hover:text-white"
              >
                <GithubIcon className="size-6" />
              </a>
              <a
                  href="https://cmelion.github.io/token-trio-calculator/storybook/"
                  target="_blank"
                  rel="noreferrer"
                  title="View Storybook"
                  aria-label="Storybook"
                  className="p-2 text-foreground/70 transition-colors hover:text-foreground dark:text-white/70 dark:hover:text-white"
              >
                <Icons.storybook className="size-6" />
              </a>
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>
  )
}