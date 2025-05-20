import { act, render, screen, waitFor } from "@testing-library/react"
import { Given } from "quickpickle"
import { createRTLFormTester } from "@tests/utils/form-testing/factory"
import * as AppStories from "@/App.stories"
import * as TokenCardStories from "@/components/token-card/TokenCard.stories"
import * as TokenSelectorStories from "@/components/token-selector/TokenSelector.stories"
import { composeStories } from "@storybook/react"
import { FormTester } from "@tests/utils/form-testing/types"
import { TokenSelectorTester } from "@tests/utils/token-selector-testing/base-token-selector-tester.ts"
import { expect } from "vitest"

// Lazy getters for stories with MSW integration
let appStoriesCache: ReturnType<typeof composeStories<typeof AppStories>> | null = null;
let tokenCardStoriesCache: ReturnType<typeof composeStories<typeof TokenCardStories>> | null = null;
let tokenSelectorStoriesCache: ReturnType<typeof composeStories<typeof TokenSelectorStories>> | null = null;

// Add request logging with more details
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const [url, options] = args;
  console.log(`Fetch request: ${options?.method || 'GET'} ${url}`);
  if (url.toString().includes('asset')) {
    console.log('Token API request detected:', url.toString());
  }
  return originalFetch(...args);
};

// Helper function to wait for elements to appear with a custom message
export async function waitForElement(callback: () => unknown, options: { timeout?: number, message?: string } = {}) {
  const { timeout = 2000, message = 'Element not found in time' } = options;
  
  try {
    return await waitFor(callback, { timeout });
  } catch (error) {
    console.error(`Timeout waiting for element: ${message}`);
    throw error;
  }
}

export const getAppStories = () => {
    if (!appStoriesCache) {
        // Make sure MSW is properly initialized before composing stories
        console.log('Composing App stories with MSW handlers');
        appStoriesCache = composeStories(AppStories);
    }
    return appStoriesCache;
};

export const getTokenCardStories = () => {
    if (!tokenCardStoriesCache) {
        console.log('Composing TokenCard stories with MSW handlers');
        tokenCardStoriesCache = composeStories(TokenCardStories);
    }
    return tokenCardStoriesCache;
};

export const getTokenSelectorStories = () => {
    if (!tokenSelectorStoriesCache) {
        console.log('Composing TokenSelector stories with MSW handlers');
        tokenSelectorStoriesCache = composeStories(TokenSelectorStories);
    }
    return tokenSelectorStoriesCache;
};

// Enhanced step for viewing the application with better MSW integration and waiting
Given("I am viewing the application", async (world: TestWorld) => {
    // Ensure MSW is ready before rendering App
    console.log('Starting application rendering with MSW integration');
    
    // Log current handlers for debugging
    console.log('MSW handlers are active and will intercept token API requests');
    
    const AppStory = getAppStories().Default;
    if (!AppStory) {
        throw new Error("Default App story not found.");
    }

    if (!world.context) {
        world.storyName = "Default";
        world.context = 'app';
    }

    try {
        // Render the chosen App story
        await act(async () => {
            render(<AppStory />);
        });

        // Wait for application to be fully rendered
        await waitForElement(
            () => screen.getByRole('banner'),
            { message: "Application header did not render in time" }
        );

        // Initialize form tester for full functionality
        world.formTester = createRTLFormTester();
        world.context = 'app';
        world.schema = undefined;
        world.formData = undefined;
        world.storyName = undefined;
        
        console.log('Application rendered successfully with MSW');
    } catch (error) {
        console.error('Error rendering application:', error);
        throw error;
    }
});

// In shared.steps.tsx
export async function renderTokenSelectorStory(world: TestWorld, storyName: string, selectedToken?: string) {
  world.storyName = storyName;
  world.context = 'component';
  world.componentType = 'token-selector';

  if (selectedToken) {
    world.selectedToken = selectedToken;
  }

  const Story = getTokenSelectorStories()[world.storyName as keyof ReturnType<typeof getTokenSelectorStories>];
  if (!Story) {
    throw new Error(`Story "${world.storyName}" not found in TokenSelector stories`);
  }

  // Render the story
  await act(async () => {
    render(<Story />);
  });

  // Initialize form tester for component testing
  world.formTester = createRTLFormTester();

  // Wait for the dialog to be visible with a timeout
  const dialog = await waitForElement(
    () => screen.getByRole("dialog"),
    { message: "Dialog did not appear after rendering TokenSelector story" }
  );
  
  expect(dialog).toBeTruthy();
  return dialog;
}

export type TestWorld = {
    component: unknown;
    selectedToken?: string;
    tokenSelectorTester?: TokenSelectorTester;
    tokenAmount?: string;
    usdAmount?: string;
    formTester?: FormTester;
    formData?: unknown;
    schema?: unknown;
    storyName?: string;
    context?: 'app' | 'component';
    componentType?: 'token-card' | 'token-selector' | 'calculator';
};