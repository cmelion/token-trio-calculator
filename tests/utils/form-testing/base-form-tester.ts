// tests/utils/form-testing/base-form-tester.ts
import { ElementAdapter } from "../adapters/element-adapter"
import { AriaRole } from "../types"
import { FormTester, FormElement, InputElement, ButtonElement } from "./types"
import { AbstractComponentTester } from "../component-testing/base-component-tester"

export class BaseFormTester
  extends AbstractComponentTester
  implements FormTester
{
  // Re-declare adapter as public to satisfy the FormTester interface
  public adapter: ElementAdapter;

  constructor(adapter: ElementAdapter) {
    super(adapter)
    this.adapter = adapter; // Ensure it's assigned to the public property
  }

  async findFormByLabel(label: string | RegExp): Promise<FormElement | null> {
    return await this.adapter.findFormByLabel(label) as Promise<FormElement | null>;
  }

  async findFieldByRole(role: AriaRole, options: { name: string | RegExp }, container?: FormElement): Promise<InputElement | null> {
    return await this.adapter.findByRole(container, role, options) as Promise<InputElement | null>;
  }

  async findButtonByRole(role: AriaRole, options: { name: string | RegExp }, container?: FormElement): Promise<ButtonElement | null> {
    return await this.adapter.findByRole(container, role, options) as Promise<ButtonElement | null>;
  }

  async findElementByRole(role: string, options: { name: string | RegExp }, container?: FormElement): Promise<FormElement | null> {
    return await this.adapter.findByRole(container, role, options) as Promise<FormElement | null>;
  }

  async waitForElementByRole(role: string, options: { name?: string | RegExp, timeout?: number } = {}, container?: FormElement): Promise<FormElement | null> {
    const { name, timeout = 5000 } = options
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      try {
        const element = await this.adapter.findByRole(container, role, { name }) as FormElement;
        if (element) {
          return element;
        }
      } catch (error) {
        // Element not found yet, continue waiting
      }

      // Small delay between attempts
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return null;
  }

  async findElementByText(text: string | RegExp, container?: FormElement): Promise<FormElement | null> {
    return await this.adapter.findByText(container, text) as Promise<FormElement | null>;
  }
}