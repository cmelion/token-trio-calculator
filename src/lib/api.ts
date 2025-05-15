
import {
  getAssetErc20ByChainAndSymbol,
  getAssetPriceInfo
} from '@funkit/api-base';

const API_KEY = 'Z9SZaOwpmE40KX61mUKWm5hrpGh7WHVkaTvQJpQk';

export interface TokenInfo {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  chainId: string;
  logoURI?: string;
  address: string;
  price: number;
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

export const supportedTokens = [
  { symbol: 'USDC', name: 'USD Coin', chainId: CHAIN_IDS.ETHEREUM },
  { symbol: 'USDT', name: 'Tether', chainId: CHAIN_IDS.ETHEREUM },
  { symbol: 'ETH', name: 'Ethereum', chainId: CHAIN_IDS.ETHEREUM },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', chainId: CHAIN_IDS.ETHEREUM },
];

export async function fetchTokenInfo(symbol: string, chainId: string): Promise<TokenInfo | null> {
  try {
    const tokenData = await getAssetErc20ByChainAndSymbol({
      chainId,
      symbol,
      apiKey: API_KEY,
    }) as TokenApiResponse;

    if (!tokenData) {
      console.error(`No token data found for ${symbol}`);
      return null;
    }

    console.log('Token data for debugging:', tokenData);

    const priceData = await getAssetPriceInfo({
      chainId,
      assetTokenAddress: tokenData.address,
      apiKey: API_KEY,
    }) as PriceApiResponse;

    console.log('Price data for debugging:', priceData);

    // Only use the API price, with fallback to 1 if no price is available
    const tokenPrice = priceData?.unitPrice || priceData?.usdPrice || priceData?.price || 1;

    return {
      id: `${chainId}-${tokenData.address}`,
      name: tokenData.name,
      symbol: tokenData.symbol,
      decimals: tokenData.decimals,
      chainId,
      address: tokenData.address,
      logoURI: tokenData.logo || tokenData.logoURI || null,
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
