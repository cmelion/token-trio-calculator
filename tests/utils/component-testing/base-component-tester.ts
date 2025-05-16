// tests/utils/component-testing/base-component-tester.ts
import { ElementAdapter } from "../adapters/element-adapter";
import { PlaywrightElementAdapter } from "../adapters/playwright-element-adapter";
import { TestRunnerType } from "../types";

// Define a proper HTML element type for our test elements
export type TestElement = Element | Node | Document | unknown;

export interface BaseComponentTester {
  clear(element: TestElement): Promise<void>;
  click(element: TestElement): Promise<void>;
  findElementByAttribute(role: string, attr: string, value: string | number | boolean): Promise<TestElement>;
  findElementByRole(
    role: string,
    options: { name: string | RegExp },
    container?: TestElement
  ): Promise<TestElement>;
  getAttribute(element: TestElement, attributeName: string): Promise<string | null>;
  getRunnerType(): TestRunnerType;
  getTextContent(element: TestElement): Promise<string>;
  hasElement(cell: TestElement, selector: string): Promise<boolean>;
  type(element: TestElement, value: string): Promise<void>;
}

export abstract class AbstractComponentTester implements BaseComponentTester {
  protected adapter: ElementAdapter;
  protected runnerType: TestRunnerType;

  protected constructor(adapter: ElementAdapter) {
    this.adapter = adapter;
    this.runnerType = adapter instanceof PlaywrightElementAdapter ? "playwright" : "rtl";
  }

  async clear(element: TestElement): Promise<void> {
    await this.adapter.clear(element);
  }

  async click(element: TestElement): Promise<void> {
    await this.adapter.click(element);
  }

  async findElementByAttribute(
    role: string,
    attr: string,
    value: string | number | boolean,
  ): Promise<TestElement> {
    return this.adapter.findByAttribute(role, attr, value);
  }

  async findElementByRole(
    role: string,
    options: { name: string | RegExp },
    container?: TestElement,
  ): Promise<TestElement> {
    return this.adapter.findByRole(container, role, options);
  }

  async getAttribute(
    element: TestElement,
    attributeName: string,
  ): Promise<string | null> {
    return this.adapter.getAttribute(element, attributeName);
  }

  getRunnerType(): TestRunnerType {
    return this.runnerType;
  }

  async getTextContent(element: TestElement): Promise<string> {
    return this.adapter.getTextContent(element);
  }

  async hasElement(cell: TestElement, selector: string): Promise<boolean> {
    return this.adapter.hasElement(cell, selector);
  }

  async type(element: TestElement, value: string): Promise<void> {
    await this.adapter.type(element, value);
  }
}