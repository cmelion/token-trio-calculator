import { ElementAdapter } from './element-adapter';
import { Locator, Page } from '@playwright/test';
import { AriaRole } from '../types';

export class PlaywrightElementAdapter implements ElementAdapter<Locator> {
  constructor(private page: Page) {}

  async findByRole(container: Locator | null, role: string, options: Record<string, unknown> = {}) {
    const target = container || this.page;
    return target.getByRole(role as AriaRole, options).first();
  }

  async findAllByRole(container: Locator | null, role: string, options: Record<string, unknown> = {}) {
    const target = container || this.page;
    return target.getByRole(role as AriaRole, options).all();
  }

  async findFormByLabel(label: string | RegExp) {
    // Try to find a form by accessible name
    const form = await this.findByRole(null, 'form', { name: label }).catch(() => null);
    if (form) return form;
    // Fallback: try dialog by accessible name
    return this.findByRole(null, 'dialog', { name: label }).catch(() => null);
  }

  async getTextContent(element: Locator) {
    return (await element.textContent()) || '';
  }

  async hasElement(element: Locator, selector: string) {
    return (await element.locator(selector).count()) > 0;
  }

  async getAttribute(element: Locator, attr: string) {
    // For input values, use inputValue() which is more reliable for form controls
    if (attr === 'value') {
      try {
        // Check if this is an input, textarea, or select element
        const tagName = await element.evaluate((el: HTMLElement) =>
          el.tagName?.toLowerCase(),
        );
        if (['input', 'textarea', 'select'].includes(tagName)) {
          return element.inputValue();
        }
      } catch (e) {
        // Fall back to getAttribute if the above fails
      }
    } else if (attr === 'checked') {
      // For checkboxes, isChecked() is more reliable
      try {
        return await element.isChecked() ? 'true' : null;
      } catch (e) {
        // Fall back to getAttribute
      }
    } else if (attr === 'selectedIndex') {
      // Handle select elements specially
      try {
        return await element.evaluate(
          (el: HTMLSelectElement) => el.selectedIndex.toString(),
        );
      } catch (e) {
        // Fall back to getAttribute
      }
    }

    // Default fallback to standard getAttribute
    return element.getAttribute(attr);
  }

  async click(element: Locator) {
    await element.click();
  }

  async findByAttribute(role: string, attr: string, value: string | number | boolean | RegExp) {
    const elements = await this.page.getByRole(role as AriaRole).all();
    for (const element of elements) {
      const attrValue = await element.getAttribute(attr);

      // Handle RegExp values properly
      if (Object.prototype.toString.call(value) === '[object RegExp]') {
        const regExpValue = value as RegExp;
        if (regExpValue.test(attrValue || '')) {
          return element;
        }
      } else if (attrValue === String(value)) {
        return element;
      }
    }
    throw new Error(`No element with role "${role}" and attribute "${attr}" matching "${value}" found.`);
  }

  async clear(element: Locator) {
    await element.fill('');
  }

  async type(element: Locator, value: string) {
    await element.fill(value);
  }

  async findByText(container: Locator | null, text: string | RegExp) {
    const target = container || this.page;
    return target.getByText(text).first();
  }
}