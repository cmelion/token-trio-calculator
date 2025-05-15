// src/components/providers/wallet/WalletContext.tsx
import React, { useState, useEffect, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import {
    WALLET_OPTIONS,
    WalletOption,
    WalletState,

} from "./walletTypes";
import { WalletContext } from "./walletContext";

export function WalletProvider({ children }: { children: ReactNode }) {
    const [isConnecting, setIsConnecting] = useState(false);
    const [wallet, setWallet] = useState<WalletState | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Use React Query for fetching and caching balances
    const { data: balancesData, refetch: refetchBalances } = useQuery({
        queryKey: ['walletBalances', wallet?.address, wallet?.option.name],
        queryFn: async () => {
            if (!wallet) return null;

            // Use the wallet's existing address or generate one if it's empty
            const address = wallet.address || `0x${Math.random().toString(16).substring(2, 14)}${Math.random().toString(16).substring(2, 14)}`;

            const response = await fetch(
                `/api/wallet/balances?provider=${wallet.option.name.toLowerCase()}&address=${address}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch wallet balances');
            }

            return response.json();
        },
        // Only run automatically for initial wallet connection
        enabled: !!wallet && wallet.address === '',

        // Caching strategy optimized for blockchain wallet balances:
        // - Balances only change when transactions occur
        // - We manually refresh after transactions with refreshBalances()
        // - No need for frequent automatic refetches
        staleTime: 120000,  // Consider data fresh for 2 minutes since balances rarely change without transactions
        gcTime:    300000,  // Keep cached data for 5 minutes to reduce unnecessary API calls

        // Disable automatic refetching triggers to prevent unnecessary API calls
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    useEffect(() => {
        if (balancesData && wallet && wallet.address === '') {
            // Only update if this is the initial wallet setup
            setWallet({
                ...wallet,
                address: balancesData.address,
                balances: balancesData.balances
            });

            toast({
                title: "Wallet Connected",
                description: `Connected to ${wallet.option.name} with ${Object.keys(balancesData.balances).length} tokens`,
            });
        }
    }, [balancesData, toast, wallet]);

    const connect = async (walletOption: WalletOption) => {
        setIsConnecting(true);

        try {
            // Simulate connection delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Set initial wallet state with empty address
            setWallet({
                option: walletOption,
                address: '', // Empty address triggers the useQuery
                balances: {}
            });

            // Fetch balances will happen automatically via the useQuery hook
        } catch (error) {
            console.error("Wallet connection error:", error);
            toast({
                title: "Connection Failed",
                description: "Failed to connect to wallet. Please try again.",
                variant: "destructive",
            });
            setWallet(null);
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnect = () => {
        setWallet(null);
        // Clear related queries
        queryClient.invalidateQueries({ queryKey: ['walletBalances'] });
        toast({
            title: "Wallet Disconnected",
            description: "Your wallet has been disconnected",
        });
    };

    const refreshBalances = async () => {
        if (!wallet) return;
        // Manually trigger a refresh - typically called after transactions or when user explicitly requests
        const result = await refetchBalances();

        if (result.data) {
            setWallet(prev => prev ? {
                ...prev,
                balances: result.data.balances
            } : null);

            toast({
                title: "Balances Updated",
                description: `Updated ${Object.keys(result.data.balances).length} token balances`,
            });
        }
    };

    const value = {
        wallet,
        isConnecting,
        connect,
        disconnect,
        refreshBalances,
        walletOptions: WALLET_OPTIONS,
    };

    return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
