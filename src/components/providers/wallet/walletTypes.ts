// src/components/providers/wallet/walletTypes.ts
export const WALLET_OPTIONS = [
    { name: "MetaMask", icon: "metamask" },
    { name: "WalletConnect", icon: "walletconnect" },
    { name: "Coinbase Wallet", icon: "coinbase" },
    { name: "Trust Wallet", icon: "trust" },
] as const;

export type WalletOption = typeof WALLET_OPTIONS[number];

export interface TokenBalance {
    symbol: string;
    balance: string;
    usdValue: string;
}

export interface WalletState {
    option: WalletOption;
    address: string;
    balances: Record<string, TokenBalance>;
}

export interface WalletContextType {
    wallet: WalletState | null;
    isConnecting: boolean;
    connect: (option: WalletOption) => Promise<void>;
    disconnect: () => void;
    refreshBalances: () => Promise<void>;
    walletOptions: typeof WALLET_OPTIONS;
}

export interface WalletBalancesResponse {
    address: string;
    balances: Record<string, TokenBalance>;
}