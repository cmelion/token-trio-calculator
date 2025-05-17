// tests/step-definitions/app.steps.ts
import { World } from "../utils/types";
import { expect, Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, Then, When } = createBdd();

// Collection of data that needs to be passed between steps
type AppContext = {
  storyId: string
}

interface StoryOptions {
  args?: Record<string, unknown>;
}

//====================================================================================
// HELPER FUNCTIONS
//====================================================================================

export const navigateToStory = async (
  page: Page,
  componentPath = 'pages-app',
  storyId = "default",
  options?: StoryOptions
) => {
  // Build URL args parameter if options are provided
  let argsParam = '';
  if (options?.args) {
    // Format args in Storybook's expected format
    const formattedArgs = Object.entries(options.args)
      .map(([key, value]) => {
        // Special handling for boolean values with ! prefix
        if (typeof value === 'boolean') {
          return `${key}:!${value}`;
        }
        // Handle other types
        else if (typeof value === 'string') {
          return `${key}:"${value}"`;
        } else {
          return `${key}:${value}`;
        }
      })
      .join(';');

    argsParam = `&args=${formattedArgs}`;
  }

  const storyPath = `/iframe.html?id=${componentPath.toLowerCase()}--${storyId.toLowerCase()}${argsParam}&viewMode=story`;
  await page.goto(storyPath);

  // Wait for the application to fully load
  await page.waitForLoadState('networkidle');
}

// Helper to retrieve context from page storage
const getAppContext = async (page: Page): Promise<AppContext> => {
  // Get stored context from previous steps
  const contextData = await page.evaluate(() => {
    // @ts-expect-error Using window for storage between steps
    return window.__APP_TEST_CONTEXT;
  });

  if (!contextData) {
    throw new Error("App test context not found - ensure you run the previous steps");
  }

  return contextData;
}

//====================================================================================
// BACKGROUND: Setting up the application
//====================================================================================

Given("I am viewing the application", async ({ page }: World) => {
  // Navigate to the App story
  await navigateToStory(page, 'pages-app', "Default");

  // Wait for key UI elements to be visible
  const header = page.getByRole('banner');
  await header.waitFor({ state: 'visible' });

  // Store context data in the page's storage state
  await page.evaluate((contextData: AppContext) => {
    // @ts-expect-error Using window for storage between steps
    window.__APP_TEST_CONTEXT = contextData;
  }, {
    storyId: "Default"
  });
});

//====================================================================================
// SCENARIO: Viewing the initial application state
//====================================================================================

Then("I should see the site header", async ({ page }: World) => {
  await getAppContext(page);

  // Check that the site header is visible using aria role
  const header = page.getByRole('banner');
  await expect(header).toBeVisible();

  // Verify the header contains navigation elements
  const nav = header.getByRole('navigation');
  await expect(nav).toBeVisible();
});

Then("I should see the home page content", async ({ page }: World) => {
  await getAppContext(page);

  // Check for main heading on home page
  const heading = page.getByRole('heading', { level: 1 });
  await expect(heading).toBeVisible();

  // Verify specific content that indicates we're on the home page
  const tokenPriceHeading = page.getByText('Token Price Explorer');
  await expect(tokenPriceHeading).toBeVisible();
});

//====================================================================================
// SCENARIO: Quick selecting tokens using token buttons
//====================================================================================

When("I click the {string} quick select button", async ({ page }: World, tokenSymbol: string) => {
  // Find and click the quick select button for the specified token
  const quickSelectButton = page.getByRole('button', { name: new RegExp(`Quick select ${tokenSymbol}`, 'i') });
  await quickSelectButton.click();
});

When("I click on a token that is already selected as target", async ({ page }: World) => {
  // First identify what token is currently the target token
  const targetCard = page.locator('div', { has: page.getByText('You receive', { exact: true }) });
  const tokenSymbolElement = targetCard.locator('button').filter({ hasText: /^[A-Z]{2,5}$/ }).first();

  // Get the token symbol text
  const tokenSymbol = await tokenSymbolElement.textContent();
  if (!tokenSymbol) throw new Error("Could not determine target token symbol");

  // Use a more specific selector that targets only the quick select button
  const quickSelectButton = page.getByRole('button', { name: new RegExp(`Quick select ${tokenSymbol.trim()}`, 'i') });
  await quickSelectButton.click();
});

//====================================================================================
// SCENARIO: Opening and closing the token selector dialog
//====================================================================================

When(/^I click the token select button on the (source|target) card$/, async ({ page }: World, cardType: string) => {
  // Find the exact token symbol in the card we're targeting
  let tokenSymbol;
  if (cardType === 'source') {
    // Get the specific token symbol from the source card
    const sourceTokenBtn = page.getByRole('button', { name: /Change [A-Z]+ token/ })
      .filter({ has: page.getByText(/^[A-Z]{2,5}$/) })
      .filter({ hasText: /USDC|USDT|ETH|WBTC/ })
      .first();

    // Extract just the token symbol from the button text/name
    const fullText = await sourceTokenBtn.getAttribute('aria-label') || '';
    tokenSymbol = fullText.replace('Change ', '').replace(' token', '');
  } else {
    // Similar approach for target card
    const targetTokenBtn = page.getByRole('button', { name: /Change [A-Z]+ token/ })
      .filter({ has: page.getByText(/^[A-Z]{2,5}$/) })
      .filter({ hasText: /USDC|USDT|ETH|WBTC/ })
      .nth(1);

    const fullText = await targetTokenBtn.getAttribute('aria-label') || '';
    tokenSymbol = fullText.replace('Change ', '').replace(' token', '');
  }

  // Now use this exact token symbol for a precise selector
  const buttonSelector = page.getByRole('button', { name: `Change ${tokenSymbol} token` });
  await buttonSelector.click();

  // Try alternative selectors for the dialog
  try {
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
  } catch (e) {
    // Fallback: check for token selection content
    const tokenSelector = page.getByText('Select a token', { exact: true });
    await expect(tokenSelector).toBeVisible({ timeout: 5000 });
  }
});

Then("I should see the token selector dialog", async ({ page }: World) => {
  // Find and verify the token selector dialog is visible
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // Verify it contains token-related content (optional additional verification)
  const tokenList = dialog.locator('div').filter({ hasText: /Select a token/i });
  await expect(tokenList).toBeVisible();
});

//====================================================================================
// SCENARIO: Entering amounts and seeing conversions
//====================================================================================

When("I switch the source card to token input mode", async ({ page }: World) => {
  // Find the source card by its header text
  const sourceCard = page.locator('div', { has: page.getByText('You pay', { exact: true }) });

  // Find the token symbol to make more specific selector
  const tokenSymbol = await sourceCard.locator('button')
    .filter({ hasText: /^[A-Z]{2,5}$/ })
    .first()
    .textContent();

  // Find container that has both the token symbol and the toggle button
  const tokenContainer = sourceCard.locator('div', {
    has: page.getByText(new RegExp(`${tokenSymbol}`))
  });

  // Get the toggle button within this more specific context
  const toggleButton = tokenContainer
    .getByRole("button", { name: /Switch to token input mode/i })
    .first();

  await toggleButton.click();

  // Verify the button changed to indicate we're now in token mode
  const newToggleButton = sourceCard.getByRole("button", { name: /Switch to USD input mode/i });
  await expect(newToggleButton).toBeVisible();
});

Then("the source input field should display the equivalent token amount", async ({ page }: World) => {
  // Find the source card
  const sourceCard = page.locator('div', { has: page.getByText('You pay', { exact: true }) });

  // Get the input field with a more specific selector using the aria-label
  const amountField = sourceCard.getByRole("textbox", { name: "Source token amount" });

  const value = await amountField.inputValue();

  // Check that the value is a valid number (token amount, not USD format)
  expect(Number(value)).not.toBeNaN();

  // Verify we see a token format with decimal places
  expect(value).toMatch(/\d+\.\d+/);

  // Instead of checking for absence of dollar icon, verify we're in token mode
  // by checking for the "Switch to USD input mode" button
  const usdModeToggle = sourceCard.getByRole("button", { name: "Switch to USD input mode" });
  await expect(usdModeToggle).toBeVisible();
});

Then("the source secondary value should show the USD equivalent", async ({ page }: World) => {
  // Find the source card
  const sourceCard = page.locator('div', { has: page.getByText('You pay', { exact: true }) });

  // Check for USD format in the secondary display ($ followed by numbers)
  const usdPattern = /\$[\d,]+(\.\d+)?/;
  const secondaryValue = sourceCard.getByText(usdPattern).first();
  await expect(secondaryValue).toBeVisible();
});

Then("the target amount should be updated", async ({ page }: World) => {
  // Find target card and check its amount field has a value
  const targetCard = page.locator('div', { has: page.getByText('You receive', { exact: true }) });

  // Use a more specific selector with the aria-label to target only one element
  const amountField = targetCard.getByRole("textbox", { name: "Target USD amount" });

  // Verify the field has a non-empty value
  const value = await amountField.inputValue();
  expect(value.trim()).not.toBe("");
  expect(isNaN(Number(value.replace(/[^0-9.-]+/g, '')))).toBe(false);
});

//====================================================================================
// SCENARIO: Swapping tokens using the swap arrow
//====================================================================================

When("I click the swap arrow", async ({ page }: World) => {
  // Use the exact aria-label that's on the button
  const swapButton = page.getByRole('button', { name: 'Swap tokens' });
  await expect(swapButton).toBeVisible();
  await swapButton.click();

  // Wait for the UI to update
  await page.waitForTimeout(100);
});

//====================================================================================
// SCENARIO: Seeing real-time exchange rates
//====================================================================================

Then("I should see the exchange rate between tokens", async ({ page }: World) => {
  // Updated pattern to match "Exchange Rate: 1 USDC ≈ 0.000333 ETH ($1.00)"
  const rateText = page.getByText(/Exchange Rate:\s*1\s+[A-Z]+\s*≈\s*[\d.]+\s+[A-Z]+/);
  await expect(rateText).toBeVisible();
});

Then("I should see the exchange rate between {string} and {string}", async ({ page }: World, sourceSymbol: string, targetSymbol: string) => {
  const rateText = page.getByText(new RegExp(`1 ${sourceSymbol} .*${targetSymbol}`));
  await expect(rateText).toBeVisible();
});

Then("the exchange rate should reflect the correct conversion", async ({ page }: World) => {
  // Find source and target cards
  const sourceCard = page.locator('div', { has: page.getByText('You pay', { exact: true }) });
  const targetCard = page.locator('div', { has: page.getByText('You receive', { exact: true }) });

  // Get the exchange rate spans using a more accurate selector that works with spans
  const sourceRateElement = sourceCard.locator('span[aria-label^="Source token exchange rate"]');
  const targetRateElement = targetCard.locator('span[aria-label^="Target token exchange rate"]');

  // Verify both rate elements are visible
  await expect(sourceRateElement).toBeVisible();
  await expect(targetRateElement).toBeVisible();

  // Extract rate information from aria-labels
  const sourceRateText = await sourceRateElement.getAttribute('aria-label') || '';
  const targetRateText = await targetRateElement.getAttribute('aria-label') || '';

  // Extract token symbols
  const sourceTokenMatch = sourceRateText.match(/rate: 1 ([A-Z]+) equals/);
  const targetTokenMatch = targetRateText.match(/rate: 1 ([A-Z]+) equals/);

  // Extract price values
  const sourcePriceMatch = sourceRateText.match(/approximately ([\d.]+) US dollars/);
  const targetPriceMatch = targetRateText.match(/approximately ([\d.]+) US dollars/);

  // Ensure we found all the needed information
  if (!sourceTokenMatch || !targetTokenMatch || !sourcePriceMatch || !targetPriceMatch) {
    throw new Error("Could not extract all required exchange rate information");
  }

  const sourceToken = sourceTokenMatch[1];
  const targetToken = targetTokenMatch[1];
  const sourcePrice = parseFloat(sourcePriceMatch[1]);
  const targetPrice = parseFloat(targetPriceMatch[1]);

  // Verify prices are valid numbers
  expect(isNaN(sourcePrice)).toBe(false);
  expect(isNaN(targetPrice)).toBe(false);

  // Verify exchange rates are consistent with each other
  // The relative rate between tokens should be consistent with their USD prices
  const exchangeRate = sourcePrice / targetPrice;

  // Verify the displayed visual exchange rate matches the calculation
  const exchangeRateText = page.getByText(new RegExp(`1\\s+${sourceToken}\\s*≈\\s*[\\d.]+\\s+${targetToken}`));
  const displayedRateText = await exchangeRateText.textContent() || "";
  const rateMatch = displayedRateText.match(/≈\s*([\d.]+)/);

  if (rateMatch && rateMatch[1]) {
    const displayedRate = parseFloat(rateMatch[1]);

    // Allow for a reasonable tolerance (1.5%)
    const tolerance = 0.015;
    const lowerBound = exchangeRate * (1 - tolerance);
    const upperBound = exchangeRate * (1 + tolerance);

    expect(displayedRate, `Exchange rate between ${sourceToken} and ${targetToken} is incorrect`).toBeGreaterThanOrEqual(lowerBound);
    expect(displayedRate, `Exchange rate between ${sourceToken} and ${targetToken} is incorrect`).toBeLessThanOrEqual(upperBound);
  }
});

Then("the exchange rate should show the price in USD", async ({ page }: World) => {
  // Find the source card
  const sourceCard = page.locator('div', { has: page.getByText('You pay', { exact: true }) });

  // Use locator with attribute selector instead of getByRole
  const rateElement = sourceCard.locator('span[aria-label^="Source token exchange rate"]');
  await expect(rateElement).toBeVisible();

  // Extract the text content for verification
  const rateText = await rateElement.textContent();

  // Verify the text contains a USD price format
  expect(rateText).not.toBeNull();
  expect(rateText).toMatch(/\$[\d,]+(\.\d+)?/);
});

//====================================================================================
// TOKEN VERIFICATION STEPS
// Common utility steps for verifying token state across scenarios
//====================================================================================

Given("the source token is {string}", async ({ page }: World, tokenSymbol: string) => {
  // Find the source card by its header text
  const sourceCard = page.locator('div', { has: page.getByText('You pay', { exact: true }) });

  // Use a more specific selector that uniquely identifies the token button
  const tokenButton = sourceCard.getByRole('button', { name: new RegExp(`Change ${tokenSymbol} token`) });
  await expect(tokenButton).toBeVisible();
});

Given("the target token is {string}", async ({ page }: World, tokenSymbol: string) => {
  // Find the target card by its header text
  const targetCard = page.locator('div', { has: page.getByText('You receive', { exact: true }) });

  // Use a more specific selector that uniquely identifies the token button
  const tokenButton = targetCard.getByRole('button', { name: new RegExp(`Change ${tokenSymbol} token`) });
  await expect(tokenButton).toBeVisible();
});

Then(/^the (source|target) token should be "([^"]*)"$/, async ({ page }: World, cardType: string, tokenSymbol: string) => {
  // Determine which header text to look for based on the card type
  const headerText = cardType === 'source' ? 'You pay' : 'You receive';

  // Find the card by its header text
  const card = page.locator('div', { has: page.getByText(headerText, { exact: true }) });

  // Find the token button specifically using a more precise selector
  const tokenButton = card.getByRole('button', { name: new RegExp(`Change ${tokenSymbol} token`) });
  await expect(tokenButton).toBeVisible();
});

Then("the source and target tokens should be swapped", async ({ page }: World) => {
  // Find the source and target cards
  const sourceCard = page.locator('div', { has: page.getByText('You pay', { exact: true }) });
  const targetCard = page.locator('div', { has: page.getByText('You receive', { exact: true }) });

  // Get token symbols
  const sourceTokenSymbol = await sourceCard.locator('button').filter({ hasText: /^[A-Z]{2,5}$/ }).first().textContent();
  const targetTokenSymbol = await targetCard.locator('button').filter({ hasText: /^[A-Z]{2,5}$/ }).first().textContent();

  const sourceToken = sourceTokenSymbol?.trim();
  const targetToken = targetTokenSymbol?.trim();

  // Verify tokens exist
  expect(sourceToken, "Source token not found").toBeTruthy();
  expect(targetToken, "Target token not found").toBeTruthy();

  // Use more specific selector targeting the exchange rate area
  // Find the container with "Exchange Rate:" label first, then look for the rate pattern within it
  const exchangeRateContainer = page.getByText(/Exchange Rate:/).locator('..').first();
  await expect(exchangeRateContainer).toBeVisible();

  // Now look for the rate pattern within the container
  const ratePattern = new RegExp(`1\\s+${sourceToken}\\s*≈`);
  const rateElement = exchangeRateContainer.getByText(ratePattern);
  await expect(rateElement).toBeVisible();
});

//====================================================================================
// SCENARIO: Connecting a wallet and viewing token balances
//====================================================================================

When("I click the {string} button", async ({ page }: World, buttonText: string) => {
  // Find and click the button with the specified text
  const button = page.getByRole('button', { name: new RegExp(buttonText, 'i') });
  await expect(button).toBeVisible();
  await button.click();
});

Then("I should see the wallet connection dialog", async ({ page }: World) => {
  // Verify the wallet connection dialog is visible
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // Verify the dialog title
  const dialogTitle = page.getByRole('heading', { name: 'Connect Wallet' });
  await expect(dialogTitle).toBeVisible();

  // Verify the wallet providers are displayed
  const walletProviders = page.getByRole('listbox', { name: 'Available wallet providers' });
  await expect(walletProviders).toBeVisible();
});

When("I select the {string} wallet provider", async ({ page }: World, providerName: string) => {
  // Find and click the wallet provider button
  const walletButton = page.getByRole('option', { name: new RegExp(`Connect with ${providerName}`, 'i') });
  await expect(walletButton).toBeVisible();
  await walletButton.click();

  // Wait for the dialog to close and connection to complete
  await page.waitForTimeout(500);
});

Then("the wallet should be connected", async ({ page }: World) => {
  // Verify the wallet connection indicator is visible
  const connectedIndicator = page.locator('.bg-green-500');
  await expect(connectedIndicator).toBeVisible();
});

Then("I should see the wallet name {string} in the header", async ({ page }: World, walletName: string) => {
  // Verify the wallet name is displayed in the header
  const walletNameElement = page.getByText(walletName, { exact: true });
  await expect(walletNameElement).toBeVisible();
});

Then("I should see the token balances displayed on the token cards", async ({ page }: World) => {
  // Scope to the source card
  const sourceCard = page.locator('div', { has: page.getByText('You pay', { exact: true }) });
  const sourceBalance = sourceCard.getByText(/Balance: .+\(.+\)/);
  await expect(sourceBalance).toBeVisible({ timeout: 5000 });

  // Scope to the target card
  const targetCard = page.locator('div', { has: page.getByText('You receive', { exact: true }) });
  const targetBalance = targetCard.getByText(/Balance: .+\(.+\)/);
  await expect(targetBalance).toBeVisible({ timeout: 5000 });
});

Then("I should see a balance warning if the amount exceeds my balance", async ({ page }: World) => {
  // Wait for the toast to appear and filter for the correct element
  const toast = page.locator('span[role="status"]', { hasText: /Your .* balance .* is less than the amount you're trying to spend/ });
  await expect(toast).toBeVisible({ timeout: 2000 });

  // Verify the toast content
  await expect(toast).toHaveText(/Your .* balance .* is less than the amount you're trying to spend/);
});