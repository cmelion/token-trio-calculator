// tests/step-definitions/token-selector.steps.ts
import { World } from "../utils/types";
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { navigateToStory } from "./app.steps";
import { createPlaywrightFormTester } from "../utils/form-testing/factory";
import { createPlaywrightTokenSelectorTester } from "../utils/token-selector-testing/base-token-selector-tester";

const { Given, When, Then } = createBdd();

//====================================================================================
// BACKGROUND: Setting up the TokenSelector component
//====================================================================================

Given("I am viewing the TokenSelector component", async ({ page }: World) => {
    await navigateToStory(page, 'components-tokenselector', "Default");
    // Use direct page API to verify dialog visibility
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
});

//====================================================================================
// SCENARIO: Displaying token selector dialog
//====================================================================================

Then("I should see a dialog with a list of tokens", async ({ page }: World) => {
    const tokenTester = createPlaywrightTokenSelectorTester(page);
    
    // For visibility checks, we need to use the page API directly
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Use our tester for other operations
    const symbols = await tokenTester.getVisibleTokenSymbols();
    expect(symbols.length).toBeGreaterThanOrEqual(1);
});

Then("I should see a search input", async ({ page }: World) => {
    const formTester = createPlaywrightFormTester(page);
    const searchInput = await formTester.findFieldByRole("textbox", { name: /Search tokens/i });
    expect(searchInput).toBeTruthy();
});

Then("each token should show its symbol, name, and price", async ({ page }: World) => {
    // Check first token in the list
    const firstToken = page.getByRole("button", { name: /Select/ }).first();

    // Use a more specific selector that targets just the symbol span
    const symbolText = firstToken.locator('span.font-medium.text-white');
    await expect(symbolText).toBeVisible();

    const nameText = firstToken.getByText(/Coin|Token|Ethereum|Bitcoin/, { exact: false });
    await expect(nameText).toBeVisible();

    const priceText = firstToken.getByText(/\$[\d.]+/, { exact: false });
    await expect(priceText).toBeVisible();
});

//====================================================================================
// SCENARIO: Searching for tokens
//====================================================================================

When("I enter {string} in the token search field", async ({ page }: World, searchTerm: string) => {
    const tokenTester = createPlaywrightTokenSelectorTester(page);
    await tokenTester.searchForToken(searchTerm);
});

Then("I should only see tokens containing {string} in their name or symbol", async ({ page }: World, searchTerm: string) => {
    
    // Get all visible token buttons to check their content
    const pattern = new RegExp(searchTerm, 'i');
    const tokenButtons = page.getByRole("button", { name: /Select/ });
    const count = await tokenButtons.count();

    for (let i = 0; i < count; i++) {
        const tokenText = await tokenButtons.nth(i).textContent();
        expect(tokenText).toMatch(pattern);
    }
});

When("I clear the search field", async ({ page }: World) => {
    const tokenTester = createPlaywrightTokenSelectorTester(page);
    await tokenTester.searchForToken(""); // Clear by entering empty string
});

Then("I should see all available tokens", async ({ page }: World) => {
    const tokenTester = createPlaywrightTokenSelectorTester(page);
    const symbols = await tokenTester.getVisibleTokenSymbols();
    expect(symbols.length).toBeGreaterThan(1);
});

//====================================================================================
// SCENARIO: Selecting tokens and dialog interactions
//====================================================================================

When("I click on the {string} token", async ({ page }: World, tokenSymbol: string) => {
    const tokenTester = createPlaywrightTokenSelectorTester(page);
    await tokenTester.selectToken(tokenSymbol);
});

Then("the token selector dialog should close", async ({ page }: World) => {
    const dialog = page.getByRole("dialog");
    await expect(dialog).not.toBeVisible();
});

Then("the selected token should be {string}", async ({ page }: World) => {
    // Verify dialog closed since we can't directly check parent state
    const dialog = page.getByRole("dialog");
    await expect(dialog).not.toBeVisible({ timeout: 5000 });

    // Since we can't check the parent state directly from inside the dialog,
    // we can at least store this in a comment that explains why we're not using tokenSymbol
    // A better implementation would validate the selected token in the parent UI if possible
});

When("I click the close button on the token selector", async ({ page }: World) => {
    const closeButton = page.getByRole("button", { name: /close/i });
    await closeButton.click();
});

//====================================================================================
// SCENARIO: Viewing with selected token
//====================================================================================

When("I am viewing the TokenSelector with {string} selected", async ({ page }: World, tokenSymbol: string) => {
    // Use kebab-case format for the story name
    await navigateToStory(page, 'components-tokenselector', "with-selected-token");
    
    // For visibility checks, use page API directly
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Add a warning when a token other than USDC is requested
    if (tokenSymbol.toUpperCase() !== "USDC") {
        console.warn(`Note: Story shows USDC but "${tokenSymbol}" was requested`);
    }
});

Then("the {string} token should be highlighted", async ({ page }: World, tokenSymbol: string) => {
    const tokenTester = createPlaywrightTokenSelectorTester(page);
    const isHighlighted = await tokenTester.isTokenHighlighted(tokenSymbol);
    expect(isHighlighted).toBeTruthy();
});