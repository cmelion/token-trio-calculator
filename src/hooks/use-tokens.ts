import { useQuery } from '@tanstack/react-query';
import { fetchTokenMetadata, fetchTokenPrice, TokenInfo, TokenMetadata, fetchAllSupportedTokens } from '@/lib/api';

/**
 * Hook to fetch only the token metadata (static information that rarely changes).
 *
 * This query is configured with long cache times since token metadata (name, symbol,
 * decimals, etc.) changes very infrequently. This significantly reduces API calls
 * and improves application performance.
 *
 * @param symbol - The token symbol (e.g., "ETH", "BTC")
 * @param chainId - The blockchain network identifier
 * @returns Query result with token metadata, loading state, and error information
 */
export function useTokenMetadata(symbol: string, chainId: string) {
  return useQuery<TokenMetadata | null, Error>({
    // Unique key for this query, includes both token symbol and chain ID
    // to properly cache different tokens across different chains
    queryKey: ['tokenMetadata', symbol, chainId],

    // The fetch function that retrieves only the metadata for this specific token/chain
    queryFn: () => fetchTokenMetadata(symbol, chainId),

    // Keep metadata "fresh" for 4 hours before considering it stale
    // Token metadata rarely changes, so we can avoid unnecessary refetches
    staleTime: 4 * 60 * 60 * 1000, // 4 hours

    // Keep unused metadata in cache for 24 hours before garbage collection
    // This prevents re-fetching if user navigates away and returns later
    gcTime: 24 * 60 * 60 * 1000,   // 24 hours

    // Only execute the query when both parameters are provided
    // Prevents unnecessary API calls with incomplete data
    enabled: Boolean(symbol && chainId),

    // Use previous data while fetching new data
    // Provides smoother UX by avoiding empty states during refetches
    placeholderData: (previousData) => previousData ?? null,
  });
}

/**
 * Hook to fetch only the token price (volatile data that changes frequently).
 *
 * This query is configured with short cache times since prices can change rapidly.
 * It separates price fetching from metadata to reduce unnecessary API calls while
 * keeping price data current.
 *
 * @param address - The token contract address
 * @param chainId - The blockchain network identifier
 * @param options - Additional options to control query behavior
 * @returns Query result with token price, loading state, and error information
 */
export function useTokenPrice(address: string, chainId: string, options?: { enabled?: boolean }) {
  return useQuery<number, Error>({
    // Unique key for this price query that includes token address and chain
    queryKey: ['tokenPrice', address, chainId],

    // The fetch function that retrieves only the price for this specific token
    queryFn: () => fetchTokenPrice(address, chainId),

    // Consider price data stale after 10 seconds
    // Prices can change rapidly, so we want to refresh frequently
    staleTime: 10 * 1000,        // 10 seconds

    // Refetch price data every 10 seconds to keep trading data current
    refetchInterval: 10 * 1000,  // 10 seconds

    // Continue refetching prices even when the app is in the background
    // This ensures we have current data when user returns to the active tab
    refetchIntervalInBackground: true,

    // Only fetch when explicitly enabled or when we have valid parameters
    // This prevents unnecessary API calls, especially when token metadata is loading
    enabled: options?.enabled !== undefined
      ? options.enabled
      : Boolean(address && chainId),

    // Default to 1 if no previous price data is available
    // This prevents UI glitches when transitioning between tokens
    placeholderData: (previousData) => previousData ?? 1,
  });
}

/**
 * Combined hook that provides complete token info with metadata and price.
 *
 * This hook orchestrates fetching both the rarely-changing metadata and
 * frequently-changing price data, combining them into a single TokenInfo object.
 * This approach optimizes API usage by fetching metadata infrequently while
 * keeping prices current.
 *
 * @param symbol - The token symbol (e.g., "ETH", "BTC")
 * @param chainId - The blockchain network identifier
 * @returns Combined query result with complete token information
 */
export function useTokenInfo(symbol: string, chainId: string) {
  // Fetch metadata (infrequently changing data)
  const {
    data: metadata,
    isLoading: isLoadingMetadata,
    isError: isErrorMetadata
  } = useTokenMetadata(symbol, chainId);

  // Fetch price data (frequently changing) only if we have metadata
  // This prevents unnecessary price API calls when metadata isn't available
  const {
    data: price,
    isLoading: isLoadingPrice,
    isError: isErrorPrice
  } = useTokenPrice(
    metadata?.address || '',
    chainId,
    { enabled: Boolean(metadata?.address) }
  );

  // Combine the metadata and price into a complete TokenInfo object
  // Only return data when both metadata and price are available
  const data: TokenInfo | null = metadata && price !== undefined
    ? { ...metadata, price }
    : null;

  // Combine loading and error states from both queries
  return {
    data,
    isLoading: isLoadingMetadata || isLoadingPrice,
    isError: isErrorMetadata || isErrorPrice
  };
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