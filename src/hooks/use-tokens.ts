// src/hooks/use-tokens.ts
import { useQuery } from "@tanstack/react-query";
import { fetchTokenInfo, fetchAllSupportedTokens } from "@/lib/api";

export function useTokenInfo(symbol: string, chainId: string) {
    return useQuery({
        queryKey: ['token', symbol, chainId],
        queryFn: () => fetchTokenInfo(symbol, chainId),
        refetchInterval: 4000, // Even faster refresh for single token
    });
}

export function useAllTokens() {
    return useQuery({
        queryKey: ['tokens'],
        queryFn: fetchAllSupportedTokens,
    });
}