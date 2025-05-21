// src/api/token-metadata.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type TokenMetadataResponse = {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  logoURI?: string;
  [key: string]: any;
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenMetadataResponse | ErrorResponse>
) {
  const { symbol, chainId } = req.query;

  // Ensure symbol and chainId are strings
  const symbolStr = Array.isArray(symbol) ? symbol[0] : symbol;
  const chainIdStr = Array.isArray(chainId) ? chainId[0] : chainId;

  if (!symbolStr || !chainIdStr) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const response = await fetch(
      `https://api.fun.xyz/v1/asset/erc20/${chainIdStr}/${symbolStr}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch token data';
    return res.status(500).json({ error: errorMessage });
  }
}