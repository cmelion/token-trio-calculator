// tests/utils/token-card-testing/base-token-card-tester.ts
import { Page } from "@playwright/test";
import { AbstractComponentTester } from "../component-testing/base-component-tester";
import { PlaywrightElementAdapter } from "../adapters/playwright-element-adapter";

export class TokenCardTester extends AbstractComponentTester {
  private page: Page;

  constructor(page: Page) {
    super(new PlaywrightElementAdapter(page));
    this.page = page;
  }

  /**
   * Gets the secondary text element with proper CSS escaping for Tailwind opacity modifiers
   * (handles the format text-color/opacity where / needs escaping in CSS selectors)
   */
  async getSecondaryText(): Promise<string | null> {
    // Properly escape the slash in the Tailwind opacity modifier
    const secondaryElement = await this.page.locator(".text-sm.text-primary\\/80");
    return secondaryElement.textContent();
  }

  /**
   * Checks if the secondary text contains token format (≈ number TOKEN)
   */
  async hasTokenEquivalentText(): Promise<boolean> {
    const text = await this.getSecondaryText();
    return text ? /≈\s+[\d.]+\s+[A-Z]+/.test(text) : false;
  }

  /**
   * Checks if the secondary text contains USD format
   * Match both formats: "≈ $1.00" or "≈ 0 USD"
   */
  async hasUsdEquivalentText(): Promise<boolean> {
    const text = await this.getSecondaryText();
    // Check for either "$" followed by numbers or text containing "USD"
    return text ? (/≈\s+\$[\d.]+/.test(text) || /≈\s+[\d.]+\s+USD/.test(text)) : false;
  }

  /**
   * Toggles between USD and token input modes based on current state
   */
  async toggleInputMode(targetMode: "USD" | "token"): Promise<void> {
    const currentModeIsToken = await this.page
      .getByRole("button", { name: /Switch to USD input mode/i })
      .isVisible();

    if ((targetMode === "USD" && currentModeIsToken) ||
        (targetMode === "token" && !currentModeIsToken)) {
      const toggleButton = this.page.getByRole("button", {
        name: currentModeIsToken ? /Switch to USD input mode/i : /Switch to token input mode/i
      });
      await toggleButton.click();
    }
  }

  /**
   * Enter a value in the amount field, ensuring proper clearing first
   */
  async enterAmount(value: string): Promise<void> {
    const amountField = await this.page.getByRole("textbox", { name: /amount/i });
    await amountField.clear();
    await amountField.fill(value);
  }
}