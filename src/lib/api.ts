import {
  getAssetErc20ByChainAndSymbol,
  getAssetPriceInfo
} from '@funkit/api-base';
import {UseQueryOptions} from "@tanstack/react-query";

// Replace hardcoded API key with environment variable
const API_KEY = import.meta.env.VITE_API_KEY;

// Check if we're in production (deployed Vercel environment)
const isProduction = import.meta.env.PROD && !import.meta.env.DEV && !import.meta.env.TEST;

// Update types to reflect the split
export interface TokenMetadata {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  chainId: string;
  logoURI?: string;
  address: string;
}

export interface TokenInfo extends TokenMetadata {
  price: number;
}

// Create an interface for the options parameter
export interface TokenInfoOptions extends Omit<UseQueryOptions<TokenInfo, Error, TokenInfo, string[]>, 'queryKey' | 'queryFn'> {
  enabled?: boolean;
  onSuccess?: (data: TokenInfo) => void;
}

interface TokenApiResponse {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  logo?: string;
  logoURI?: string;
}

interface PriceApiResponse {
  unitPrice?: number;
  amount?: number;
  total?: number;
  usdPrice?: number;  // Keep for backward compatibility
  price?: number;     // Keep for backward compatibility
}

const CHAIN_IDS = {
  ETHEREUM: '1',
  POLYGON: '137',
  BASE: '8453'
};

/** Limited set of supported tokens for demonstration purposes */
export const supportedTokens = [
  { symbol: 'USDC', name: 'USD Coin', chainId: CHAIN_IDS.ETHEREUM },
  { symbol: 'USDT', name: 'Tether', chainId: CHAIN_IDS.ETHEREUM },
  { symbol: 'ETH', name: 'Ethereum', chainId: CHAIN_IDS.ETHEREUM },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', chainId: CHAIN_IDS.ETHEREUM },
];

/**
 * Fetches only the token metadata without price information
 */
export async function fetchTokenMetadata(symbol: string, chainId: string): Promise<TokenMetadata | null> {
  try {
    let tokenData;

    if (isProduction) {
      // Use serverless function in production
      const response = await fetch(`/api/token-metadata?symbol=${symbol}&chainId=${chainId}`);
      tokenData = await response.json();
    } else {
      // Use direct API call for local development
      tokenData = await getAssetErc20ByChainAndSymbol({
        chainId,
        symbol,
        apiKey: API_KEY,
      });
    }

    if (!tokenData) {
      console.error(`No token data found for ${symbol}`);
      return null;
    }

    return {
      id: `${chainId}-${tokenData.address}`,
      name: tokenData.name,
      symbol: tokenData.symbol,
      decimals: tokenData.decimals,
      chainId,
      address: tokenData.address,
      logoURI: tokenData.logoURI
    };
  } catch (error) {
    console.error(`Error fetching token metadata for ${symbol}:`, error);
    return null;
  }
}

/** Fetches only the token price information */
export async function fetchTokenPrice(address: string, chainId: string): Promise<number> {
  try {
    let priceData;

    if (isProduction) {
      // Use serverless function in production
      const response = await fetch(`/api/token-price?address=${address}&chainId=${chainId}`);
      priceData = await response.json();
    } else {
      // Use direct API call for local development
      priceData = await getAssetPriceInfo({
        chainId,
        assetTokenAddress: address,
        apiKey: API_KEY,
      });
    }

    // Use the API price, with fallback to 1 if no price is available
    return priceData?.unitPrice || priceData?.usdPrice || priceData?.price || 1;
  } catch (error) {
    console.error(`Error fetching price for token at ${address}:`, error);
    return 1; // Default fallback price
  }
}

/** Update fetchTokenInfo in the same way */
export async function fetchTokenInfo(symbol: string, chainId: string): Promise<TokenInfo | null> {
  try {
    let tokenData;

    if (isProduction) {
      // Use serverless function in production
      const response = await fetch(`/api/token-metadata?symbol=${symbol}&chainId=${chainId}`);
      tokenData = await response.json();
    } else {
      // Use direct API call for local development
      tokenData = await getAssetErc20ByChainAndSymbol({
        chainId,
        symbol,
        apiKey: API_KEY,
      }) as TokenApiResponse;
    }

    if (!tokenData) {
      console.error(`No token data found for ${symbol}`);
      return null;
    }

    let priceData;

    if (isProduction) {
      // Use serverless function in production
      const response = await fetch(`/api/token-price?address=${tokenData.address}&chainId=${chainId}`);
      priceData = await response.json();
    } else {
      // Use direct API call for local development
      priceData = await getAssetPriceInfo({
        chainId,
        assetTokenAddress: tokenData.address,
        apiKey: API_KEY,
      }) as PriceApiResponse;
    }

    const tokenPrice = priceData?.unitPrice || priceData?.usdPrice || priceData?.price || 1;

    return {
      id: `${chainId}-${tokenData.address}`,
      name: tokenData.name,
      symbol: tokenData.symbol,
      decimals: tokenData.decimals,
      chainId,
      address: tokenData.address,
      price: tokenPrice,
    };
  } catch (error) {
    console.error(`Error fetching token info for ${symbol}:`, error);
    return null;
  }
}

export async function fetchAllSupportedTokens(): Promise<TokenInfo[]> {
  try {
    const tokenPromises = supportedTokens.map(token => 
      fetchTokenInfo(token.symbol, token.chainId)
    );
    
    const results = await Promise.all(tokenPromises);
    return results.filter((token): token is TokenInfo => token !== null);
  } catch (error) {
    console.error('Error fetching all tokens:', error);
    return [];
  }
}
