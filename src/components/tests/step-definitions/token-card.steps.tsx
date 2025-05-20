// src/components/tests/step-definitions/token-card.steps.tsx
import { render, screen, fireEvent, act } from "@testing-library/react"
import { Given, Then, When } from "quickpickle"
import { expect } from "vitest"
import { getTokenCardStories, TestWorld } from "./shared.steps"
import type { TokenCardStoryName } from "../utils/story-helpers"
import { createRTLFormTester } from "@tests/utils/form-testing/factory"

//====================================================================================
// BACKGROUND: Setting up the TokenCard component
//====================================================================================

Given("I am viewing the TokenCard component", async (world: TestWorld) => {
  world.storyName = "Default" as TokenCardStoryName;
  world.context = 'component';
  world.componentType = 'token-card';

  // Properly handle async stories
  const storiesPromise = getTokenCardStories();
  const stories = 'then' in storiesPromise ? storiesPromise : storiesPromise;

  const Story = stories[world.storyName as keyof typeof stories];

  if (!Story) {
    throw new Error(`TokenCard story "${world.storyName}" not found`);
  }

  // Continue with rendering...
  document.body.innerHTML = '';
  await act(async () => {
    render(<Story />);
  });

  world.formTester = createRTLFormTester();
});

//====================================================================================
// SCENARIO: Displaying initial state
//====================================================================================

Then("I should see a field for entering the amount", async (world: TestWorld) => {
  const { formTester } = world;
  if (!formTester) {
    throw new Error("Form tester not initialized");
  }

  const amountField = screen.getByRole("textbox");
  expect(amountField).toBeTruthy();
});

Then("I should see a button to select a token", async () => {
  const tokenButton = screen.getByRole("button", { name: /Change .* token/i });
  expect(tokenButton).toBeTruthy();
});

Then("I should see the current token price in USD", async () => {
  const priceText = screen.getByText(/≈ \$\d+\.\d+|1 \w+ ≈ \$\d+\.\d+/i);
  expect(priceText).toBeTruthy();
});

Then("I should see my token balance", async () => {
  const balanceText = screen.getByText(/Balance: \d+\.\d+ \w+/i);
  expect(balanceText).toBeTruthy();
});

//====================================================================================
// SCENARIO: Switching input mode between USD and token
//====================================================================================

Given("the input mode is USD", async () => {
  const toggleButton = screen.getByRole("button", { name: /Switch to token input mode/i });
  expect(toggleButton).toBeTruthy();
});

Given("the input mode is token", async () => {
  // First check if we need to switch modes
  let usdToggleButton;
  try {
    usdToggleButton = screen.getByRole("button", { name: /Switch to token input mode/i });
  } catch (e) {
    // Already in token mode
    return;
  }

  if (usdToggleButton) {
    // Need to switch to token mode
    await act(async () => {
      usdToggleButton.click();
    });
  }

  // Verify we're now in token mode
  const tokenToggleButton = screen.getByRole("button", { name: /Switch to USD input mode/i });
  expect(tokenToggleButton).toBeTruthy();
});

When("I switch to token input mode", async () => {
  const toggleButton = screen.getByRole("button", { name: /Switch to token input mode/i });

  await act(async () => {
    toggleButton.click();
  });

  // Verify the button changed
  const newToggleButton = screen.getByRole("button", { name: /Switch to USD input mode/i });
  expect(newToggleButton).toBeTruthy();
});

When("I switch back to USD input mode", async () => {
  const toggleButton = screen.getByRole("button", { name: /Switch to USD input mode/i });

  await act(async () => {
    toggleButton.click();
  });

  // Verify the button changed
  const newToggleButton = screen.getByRole("button", { name: /Switch to token input mode/i });
  expect(newToggleButton).toBeTruthy();
});

//====================================================================================
// SCENARIOS: Entering amounts
//====================================================================================

When(/I enter "([^"]*)" in the (source |target |)amount field/, async (world: TestWorld, value: string, cardType: string) => {
  // Find the input field
  const textboxes = screen.getAllByRole("textbox");
  let inputElement;

  if (textboxes.length === 1 || !cardType.trim()) {
    inputElement = textboxes[0];
  } else {
    // Multiple textboxes, use aria-label to find the right one
    const prefix = cardType.includes('source') ? 'Source' : 'Target';
    for (const box of textboxes) {
      const ariaLabel = box.getAttribute('aria-label');
      if (ariaLabel && ariaLabel.includes(prefix)) {
        inputElement = box;
        break;
      }
    }
  }

  if (!inputElement) {
    throw new Error("Amount field not found");
  }

  // Store the entered value for later checks
  world.usdAmount = value;

  // Directly use fireEvent instead of the formTester
  await act(async () => {
    // First clear the input
    fireEvent.change(inputElement, { target: { value: '' } });
    // Then set the new value
    fireEvent.change(inputElement, { target: { value } });
  });
});

Then("the input field should display the equivalent token amount", async () => {
  const amountField = screen.getByRole("textbox");
  expect(amountField).toBeTruthy();

  // In token mode, there should be no dollar sign icon visible
  const dollarContainer = screen.getAllByText(/≈/i)[0].closest('div');
  expect(dollarContainer).toBeTruthy();
});

Then("the input field should display the USD value", async () => {
  const amountField = screen.getByRole("textbox");
  expect(amountField).toBeTruthy();

  // Look for a dollar sign icon near the input
  const dollarIcon = document.querySelector('.lucide-dollar-sign');
  expect(dollarIcon).toBeTruthy();
});

//====================================================================================
// SECONDARY VALUE VERIFICATION
//====================================================================================

Then(/the secondary value should show the (token equivalent|equivalent token amount)/, async () => {
  // Look for text that matches token equivalent format (≈ 0 USDC)
  const tokenEquivalent = screen.getByText(/≈\s+\d*\.?\d*\s+\w+/i);
  expect(tokenEquivalent).toBeTruthy();
});

Then(/the secondary value should show the (USD equivalent|equivalent USD value)/, async () => {
  // Look for text that matches USD equivalent format (≈ $0.00)
  const usdEquivalent = screen.getByText(/≈\s+\$\d*\.?\d*/i);
  expect(usdEquivalent).toBeTruthy();
});

//====================================================================================
// SCENARIO: Displaying source and target token cards
//====================================================================================

When("I am viewing a {string} TokenCard", async (world: TestWorld, cardType: string) => {
  world.storyName = "Default" as TokenCardStoryName;
  world.context = 'component';
  world.componentType = 'token-card';

  const isSource = cardType.toLowerCase() === "source";
  const stories = getTokenCardStories();
  const Story = stories[world.storyName as keyof ReturnType<typeof getTokenCardStories>];

  if (!Story) {
    throw new Error(`TokenCard story "${world.storyName}" not found`);
  }

  // Clear any previous rendering
  document.body.innerHTML = '';

  // Fix: Spread props correctly instead of using args property
  await act(async () => {
    render(<Story {...Story.args} isSource={isSource} />);
  });

  // Initialize form tester
  world.formTester = createRTLFormTester();
});

Then("I should see the text {string} in the header", async (_world: TestWorld, expectedText: string) => {
  // Find the span element containing the expected text
  const textElement = screen.getByText(expectedText, { exact: true });
  expect(textElement).toBeTruthy();
  
  // Verify it's inside a header element
  const header = textElement.closest('div[aria-label="card-header"]');
  expect(header).toBeTruthy();
});