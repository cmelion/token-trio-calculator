// tests/step-definitions/token-card.steps.ts
import { World } from "../utils/types";
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { navigateToStory } from "./app.steps";
import { createPlaywrightFormTester } from "../utils/form-testing/factory";
import { TokenCardTester } from "../utils/token-card-testing/base-token-card-tester";

const { Given, When, Then } = createBdd();

//====================================================================================
// BACKGROUND: Setting up the TokenCard component
//====================================================================================

Given("I am viewing the TokenCard component", async ({ page }: World) => {
    await navigateToStory(page, 'components-tokencard', "Default");
    const amountField = page.getByRole("textbox");
    await expect(amountField).toBeVisible();
});

//====================================================================================
// SCENARIO: Displaying initial state
// Steps to verify all expected UI elements are present on initial render
//====================================================================================

Then("I should see a field for entering the amount", async ({ page }: World) => {
    const formTester = createPlaywrightFormTester(page);
    const amountField = await formTester.findFieldByRole("textbox", { name: /amount/i });
    expect(amountField).toBeTruthy();
});

Then("I should see a button to select a token", async ({ page }: World) => {
    const formTester = createPlaywrightFormTester(page);
    const tokenButton = await formTester.findButtonByRole("button", { name: /select token|token/i });
    expect(tokenButton).toBeTruthy();
});

Then("I should see the current token price in USD", async ({ page }: World) => {
    // Look for text like "$1.00" or "USD"
    const priceText = page.getByText(/\$\d+(\.\d{2})?/i).first();
    await expect(priceText).toBeVisible();
});

Then("I should see my token balance", async ({ page }: World) => {
    // Look for text like "Balance: 123.45"
    const balanceText = page.getByText(/balance[:\s]\s*\d+(\.\d+)?/i).first();
    await expect(balanceText).toBeVisible();
});

//====================================================================================
// SCENARIO: Switching input mode between USD and token
// Steps that handle checking current input mode and switching between modes
//====================================================================================

// Input mode checking - determines which mode we're currently in by button label
Given("the input mode is USD", async ({ page }: World) => {
    // When in USD mode, the button's aria-label will be "Switch to token input mode"
    const toggleButton = page.getByRole("button", { name: /Switch to token input mode/i });
    await expect(toggleButton).toBeVisible();
});

Given("the input mode is token", async ({ page }: World) => {
    // First check if we're already in token mode or need to switch
    const tokenToggleButton = page.getByRole("button", { name: /Switch to USD input mode/i });
    const usdToggleButton = page.getByRole("button", { name: /Switch to token input mode/i });

    // If the USD mode button is visible, we need to click it to switch to token mode
    if (await usdToggleButton.isVisible()) {
        await usdToggleButton.click();
        // Now verify we've switched to token mode
        await expect(page.getByRole("button", { name: /Switch to USD input mode/i })).toBeVisible();
    } else {
        // Already in token mode, just verify
        await expect(tokenToggleButton).toBeVisible();
    }
});

// Input mode toggling - actions to change the current mode
When("I switch to token input mode", async ({ page }: World) => {
    // Find the toggle button by its aria-label when in USD mode
    const toggleButton = page.getByRole("button", { name: /Switch to token input mode/i });
    await toggleButton.click();
    // After clicking, the aria-label should change
    await expect(page.getByRole("button", { name: /Switch to USD input mode/i })).toBeVisible();
});

When("I switch back to USD input mode", async ({ page }: World) => {
    // Find the toggle button by its aria-label when in token mode
    const toggleButton = page.getByRole("button", { name: /Switch to USD input mode/i });
    await toggleButton.click();
    // After clicking, the aria-label should change
    await expect(page.getByRole("button", { name: /Switch to token input mode/i })).toBeVisible();
});

//====================================================================================
// SCENARIOS: Entering valid amounts (USD and token)
// Steps for entering values and verifying displays
//====================================================================================

// Input action - works for both USD and token input modes
When(/I enter "([^"]*)" in the (source |target |)amount field/, async ({ page }: World, value: string, cardType: string) => {
    const formTester = createPlaywrightFormTester(page);

    // Default to just finding any amount field if no card type specified (component level)
    if (!cardType.trim()) {
        const amountField = await formTester.findFieldByRole("textbox", { name: /amount/i });
        if (!amountField) throw new Error("Amount field not found");

        await formTester.clear(amountField);
        await formTester.type(amountField, value);
        return;
    }

    // Handle source/target specific scenarios (app level)
    const cardLabel = cardType.trim() === 'source' ? 'You pay' : 'You receive';
    const card = page.locator('div', { has: page.getByText(cardLabel, { exact: true }) });

    // Check which mode we're in (USD or token) first
    const isTokenMode = await card.getByRole("button", { name: /Switch to USD input mode/i }).isVisible();

    // Use aria-label to precisely target the specific input, adapting to current mode
    const labelPrefix = cardType.trim() === 'source' ? 'Source' : 'Target';
    const inputMode = isTokenMode ? 'token' : 'USD';
    const amountField = card.getByRole("textbox", { name: `${labelPrefix} ${inputMode} amount` });

    await amountField.clear();
    await amountField.fill(value);
});

// Mode-specific input display verification
Then("the input field should display the equivalent token amount", async ({ page }: World) => {
    // Check that the textbox value is a number (not USD)
    const amountField = page.getByRole("textbox");
    const value = await amountField.inputValue();
    expect(Number(value)).not.toBeNaN();
});

Then("the input field should display the USD value", async ({ page }: World) => {
    // Check that the textbox value is a number in USD format
    const amountField = page.getByRole("textbox");
    const value = await amountField.inputValue();

    // Verify it's a valid number that could represent a dollar amount
    expect(Number(value)).not.toBeNaN();

    // In USD mode, we should see the dollar sign icon next to the input
    const dollarIcon = page.locator("svg.text-white").first();
    await expect(dollarIcon).toBeVisible();
});

//====================================================================================
// SECONDARY VALUE VERIFICATION
// Steps that verify the secondary display values in both modes
//====================================================================================

// When in USD mode, the secondary value shows token equivalent
Then(/the secondary value should show the (token equivalent|equivalent token amount)/, async ({ page }: World) => {
    const tokenCardTester = new TokenCardTester(page);
    const hasTokenFormat = await tokenCardTester.hasTokenEquivalentText();
    expect(hasTokenFormat).toBeTruthy();
});

// When in token mode, the secondary value shows USD equivalent
// Using regex pattern to support multiple phrasings in the feature file
Then(/the secondary value should show the (USD equivalent|equivalent USD value)/, async ({ page }: World) => {
    const tokenCardTester = new TokenCardTester(page);
    const hasUsdFormat = await tokenCardTester.hasUsdEquivalentText();
    expect(hasUsdFormat).toBeTruthy();
});

//====================================================================================
// SCENARIO: Displaying source and target token cards
// Steps to verify the difference between source and target cards
//====================================================================================
When("I am viewing a {string} TokenCard", async ({ page }: World, cardType: string) => {
    // Navigate to the Default story with the appropriate isSource argument
    const isSource = cardType.toLowerCase() === "source";
    await navigateToStory(page, 'components-tokencard', "Default", {
        args: { isSource: isSource }
    });

    const amountField = page.getByRole("textbox");
    await expect(amountField).toBeVisible();
});

Then("I should see the text {string} in the header", async ({ page }: World, expectedText: string) => {
    const headerText = page.getByText(expectedText, { exact: true }).first();
    await expect(headerText).toBeVisible();
});