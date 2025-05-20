// src/components/tests/types.ts
import { FormTester } from "@tests/utils/form-testing/types";

export type TestWorld = {
    component: never;
    selectedToken?: string;
    tokenAmount?: string;
    usdAmount?: string;
    formTester?: FormTester;
    formData?: never;
    schema?: never;
    storyName?: string;
    context?: 'app' | 'component';
    componentType?: 'token-card' | 'token-selector' | 'calculator';
};