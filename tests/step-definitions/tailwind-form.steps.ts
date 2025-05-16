// tests/step-definitions/tailwind-form.steps.ts
import { createPlaywrightFormTester } from "../utils/form-testing/factory";
import { verifyFormSubmission, verifyFormValidation } from "../utils/form-testing/verifiers";
import { expect, Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Then } = createBdd();

// Define types for step parameters and world
type World = {
  page: Page;
};

// Renamed to avoid conflict with table steps
Then("I should see a form for creating a new record with fields", async ({ page }: World) => {
  const formTester = createPlaywrightFormTester(page);

  // Find the dialog for creating a new record
  const formDialog = await formTester.findElementByRole("dialog", { name: /create new record/i });
  expect(formDialog, "Create record dialog not found").toBeTruthy();

  // Verify essential form fields exist by finding them directly
  const nameField = await formTester.findElementByRole("textbox", { name: /name/i });
  expect(nameField, "Name field not found").toBeTruthy();

  const ageField = await formTester.findElementByRole("spinbutton", { name: /age/i });
  expect(ageField, "Age field not found").toBeTruthy();

  const emailField = await formTester.findElementByRole("textbox", { name: /email/i });
  expect(emailField, "Email field not found").toBeTruthy();
});

// Additional form-specific verification steps
Then("I should see form validation errors for required fields", async ({ page }: World) => {
  const formTester = createPlaywrightFormTester(page);

  await verifyFormValidation({
    formTester,
    fieldsToTest: [
      {
        fieldName: "name",
        invalidValue: "",
        expectedError: "Name is required"
      },
      {
        fieldName: "email",
        invalidValue: "not-an-email",
        expectedError: "Please enter a valid email"
      }
    ]
  });
});

Then("the form should be submitted successfully", async ({ page }: World) => {
  const formTester = createPlaywrightFormTester(page);

  await verifyFormSubmission({
    formTester,
    successIndicator: {
      role: "alert",
      text: /success|saved|created/i
    }
  });
});

