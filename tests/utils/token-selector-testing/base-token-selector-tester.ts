import { ElementAdapter } from "../adapters/element-adapter";
import { AbstractComponentTester, TestElement } from "../component-testing/base-component-tester";
import { Page } from "@playwright/test";
import { PlaywrightElementAdapter } from "../adapters/playwright-element-adapter";
import { RTLElementAdapter } from "../adapters/rtl-element-adapter";

export class TokenSelectorTester extends AbstractComponentTester {
  constructor(adapter: ElementAdapter) {
    super(adapter);
  }

  /**
   * Gets the token selector dialog element
   */
  async getDialog(): Promise<TestElement> {
    return this.adapter.findByRole(null, "dialog");
  }

  /**
   * Searches for tokens using the search input
   */
  async searchForToken(searchTerm: string): Promise<void> {
    const searchInput = await this.adapter.findByRole(null, "textbox", { name: /Search tokens/i });
    await this.adapter.clear(searchInput);
    await this.adapter.type(searchInput, searchTerm);
  }

  /**
   * Selects a token by its symbol
   */
  async selectToken(tokenSymbol: string): Promise<void> {
    const tokenButton = await this.adapter.findByRole(null, "button", {
      name: new RegExp(`Select ${tokenSymbol}`, 'i')
    });
    await this.adapter.click(tokenButton);
  }

  /**
   * Gets the list of visible token symbols
   */
  async getVisibleTokenSymbols(): Promise<string[]> {
    // Get all token buttons (excluding the Close button)
    const tokenButtons = await this.adapter.findAllByRole(null, "button", { name: /Select/ });
    
    const symbols: string[] = [];
    for (const button of tokenButtons) {
      // Find the symbol span directly by querying for the font-medium text element
      // or extract from the button's aria-label which follows "Select SYMBOL - NAME" format
      const buttonText = await this.adapter.getTextContent(button);
      const ariaLabel = await this.adapter.getAttribute(button, "aria-label") || buttonText;
      
      // Extract from aria-label which has format "Select SYMBOL - NAME"
      const match = ariaLabel.match(/Select\s+([A-Z0-9]+)\s*-/);
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
    const tokenButton = await this.adapter.findByRole(null, "button", {
      name: new RegExp(`Select ${tokenSymbol}`, 'i')
    });

    const className = await this.adapter.getAttribute(tokenButton, "class");
    return className?.includes('bg-primary/30') || false;
  }
}

/**
 * Creates a TokenSelectorTester for Playwright
 */
export function createPlaywrightTokenSelectorTester(page: Page): TokenSelectorTester {
  return new TokenSelectorTester(new PlaywrightElementAdapter(page));
}

/**
 * Creates a TokenSelectorTester for React Testing Library
 */
export function createRTLTokenSelectorTester(): TokenSelectorTester {
  return new TokenSelectorTester(new RTLElementAdapter());
}