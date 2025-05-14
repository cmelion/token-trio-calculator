
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
    });

    if (!tokenData) {
      console.error(`No token data found for ${symbol}`);
      return null;
    }

    const priceData = await getAssetPriceInfo({
      chainId,
      assetTokenAddress: tokenData.address,
      apiKey: API_KEY,
    });

    return {
      id: `${chainId}-${tokenData.address}`,
      name: tokenData.name,
      symbol: tokenData.symbol,
      decimals: tokenData.decimals,
      chainId,
      address: tokenData.address,
      // Access the properties correctly based on the actual API response structure
      logoURI: tokenData.logo || null,
      price: priceData ? Number(priceData.usdPrice || 0) : 0,
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
