// src/hooks/use-tokens.ts
import { useQuery } from "@tanstack/react-query";
import { fetchTokenInfo, fetchAllSupportedTokens, TokenInfo } from "@/lib/api"

/**
 * Hook to fetch information for a specific token on a specific chain.
 * 
 * @param symbol - The token symbol (e.g., "ETH", "BTC")
 * @param chainId - The blockchain network identifier
 * @returns Query result with token data, loading state, and error information
 */
export function useTokenInfo(symbol: string, chainId: string) {
    return useQuery({
        // Unique key for this query, includes both token symbol and chain ID
        // to properly cache different tokens across different chains
        queryKey: ['token', symbol, chainId],
        
        // The fetch function that retrieves data for this specific token/chain
        queryFn: () => fetchTokenInfo(symbol, chainId),
        
        // Refresh token data frequently (every 4 seconds)
        // Token prices can change rapidly, so we need fresh data for trading UI
        refetchInterval: 4000, 
        
        // Only execute the query when both parameters are provided
        // Prevents unnecessary API calls with incomplete data
        enabled: Boolean(symbol && chainId),
        
        // Use previous data while fetching new data
        // Provides smoother UX by avoiding empty states during refetches
        placeholderData: (previousData) => previousData ?? null,
    });
}

/**
 * Hook to fetch information for all supported tokens.
 * 
 * This query is configured with long cache times since the list of 
 * supported tokens changes very infrequently. This reduces network
 * requests and improves application performance.
 * 
 * @returns Query result containing array of all token information
 */
export function useAllTokens() {
  return useQuery<TokenInfo[], Error>({
    // Simple query key for the token list
    queryKey: ['tokens'],
    
    // Function that fetches all token data
    queryFn: fetchAllSupportedTokens,
    
    // Keep data "fresh" for 1 hour before considering it stale
    // Token list rarely changes, so we can avoid unnecessary refetches 
    // This significantly reduces API load and improves performance
    staleTime: 1000 * 60 * 60,     // 1 hour
    
    // Keep unused data in cache for 4 hours before garbage collection
    // If user navigates away and returns within 4 hours, we'll still have 
    // the data without needing to refetch, improving user experience
    gcTime: 1000 * 60 * 60 * 4,    // 4 hours
  });
}