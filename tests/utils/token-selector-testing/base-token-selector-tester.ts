// tests/utils/token-selector-testing/base-token-selector-tester.ts
import { Page } from "@playwright/test";
import { AbstractComponentTester } from "../component-testing/base-component-tester";
import { PlaywrightElementAdapter } from "../adapters/playwright-element-adapter";

export class TokenSelectorTester extends AbstractComponentTester {
  private page: Page;

  constructor(page: Page) {
    super(new PlaywrightElementAdapter(page));
    this.page = page;
  }

  /**
   * Gets the token selector dialog element
   */
  async getDialog() {
    return this.page.getByRole("dialog");
  }

  /**
   * Searches for tokens using the search input
   */
  async searchForToken(searchTerm: string): Promise<void> {
    const searchInput = this.page.getByRole("textbox", { name: /Search tokens/i });
    await searchInput.clear();
    await searchInput.fill(searchTerm);
  }

  /**
   * Selects a token by its symbol
   */
  async selectToken(tokenSymbol: string): Promise<void> {
    const tokenButton = this.page.getByRole("button", {
      name: new RegExp(`Select ${tokenSymbol}`, 'i')
    });
    await tokenButton.click();
  }

  /**
   * Gets the list of visible token symbols
   */
  async getVisibleTokenSymbols(): Promise<string[]> {
    const tokenButtons = this.page.getByRole("button", { name: /Select/ });
    const count = await tokenButtons.count();

    const symbols: string[] = [];
    for (let i = 0; i < count; i++) {
      const buttonText = await tokenButtons.nth(i).textContent() || "";
      const match = buttonText.match(/Select (\w+)/);
      if (match && match[1]) {
        symbols.push(match[1]);
      }
    }

    return symbols;
  }

  /**
   * Checks if a token is highlighted (selected)
   */
  async isTokenHighlighted(tokenSymbol: string): Promise<boolean> {
    const tokenButton = this.page.getByRole("button", {
      name: new RegExp(`Select ${tokenSymbol}`, 'i')
    });

    return tokenButton.evaluate(el => {
      return el.classList.contains('bg-primary/30');
    });
  }
}