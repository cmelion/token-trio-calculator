// src/components/tests/index.ts
// Import all step definitions to make them available to Vitest

// Import your component step definitions here
import './step-definitions/token-card.steps';
import './step-definitions/token-selector.steps';
import './step-definitions/shared.steps';
import './step-definitions/app.steps';

// Export setup completed flag
export const setup = true;