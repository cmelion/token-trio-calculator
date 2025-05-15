// src/components/providers/wallet/useWallet.ts
import { useContext } from "react";
import { WalletContext } from "./walletContext";
import { WalletContextType } from "./walletTypes";

export function useWallet() {
    const context = useContext<WalletContextType | undefined>(WalletContext);
    if (context === undefined) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
}