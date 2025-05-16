
// src/utils/conversion.ts
export const convertTokenValueToUsd = (value: string, price: number): string => {
    const tokenAmount = parseFloat(value);
    return !isNaN(tokenAmount) ? (tokenAmount * price).toFixed(2) : "";
};

export const syncUsdValues = (value: string, price: number, onChange: (usdValue: string) => void) => {
    const usdValue = convertTokenValueToUsd(value, price);
    onChange(usdValue);
};
