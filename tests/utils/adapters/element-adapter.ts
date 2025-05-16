export interface ElementAdapter<ElementType = unknown> {
  clear(element: ElementType): Promise<void>;
  click(element: ElementType): Promise<void>;
  findAllByRole(container: ElementType, role: string, options?: Record<string, unknown>): Promise<ElementType[]>;
  findByAttribute(role: string, attr: string, value: string | number | boolean | RegExp): Promise<ElementType>;
  findByRole(container: ElementType, role: string, options?: Record<string, unknown>): Promise<ElementType>;
  findByText(container: ElementType, text: string | RegExp): Promise<ElementType>;
  findFormByLabel(label: string | RegExp): Promise<ElementType | null>;
  getAttribute(element: ElementType, attr: string): Promise<string | null>;
  getTextContent(element: ElementType): Promise<string>;
  hasElement(element: ElementType, selector: string): Promise<boolean>;
  type(element: ElementType, value: string): Promise<void>;
}