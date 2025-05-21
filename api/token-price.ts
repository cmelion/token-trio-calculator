// api/token-price.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type PriceResponse = {
  unitPrice: number;
  [key: string]: unknown;
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PriceResponse | ErrorResponse>
) {
  const { address, chainId } = req.query;

  // Ensure address and chainId are strings
  const addressStr = Array.isArray(address) ? address[0] : address;
  const chainIdStr = Array.isArray(chainId) ? chainId[0] : chainId;

  if (!addressStr || !chainIdStr) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  try {
    // Log environment info to help debug (will appear in Vercel logs)
    console.log(`Fetching price data for chain: ${chainIdStr}, address: ${addressStr}`);

    // Check if API key exists
    const apiKey = process.env.VITE_API_KEY;
    if (!apiKey) {
      console.error('Missing API key in environment variables');
      return res.status(500).json({
        error: 'Server configuration error',
        details: 'API key not found'
      });
    }

    const response = await fetch(
        `https://api.fun.xyz/v1/asset/erc20/price/${chainIdStr}/${addressStr}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details available');
      console.error(`API error: ${response.status}`, errorText);

      return res.status(response.status).json({
        error: `API returned status ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch price data';
    return res.status(500).json({ error: errorMessage });
  }
}