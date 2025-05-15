// src/mocks/handlers.ts
import { http, HttpResponse, delay } from 'msw'
import { supportedTokens } from '@/lib/api'

// Generate consistent random balances for demo purposes
const generateBalances = (address: string, provider: string) => {
  // Use address as seed for pseudo-random generation
  const seed = address.split('').reduce((a, b) => a + b.charCodeAt(0), 0) + provider.length

  return supportedTokens.reduce((acc, token) => {
    // Generate random balances between 0.01 and 10 based on seed
    const randomBalance = (((seed * token.symbol.length) % 1000) / 100) + 0.01

    acc[token.symbol] = {
      symbol: token.symbol,
      balance: randomBalance.toFixed(4),
      usdValue: (randomBalance * (token.symbol === 'ETH' ? 3000 : token.symbol === 'WBTC' ? 60000 : 1)).toFixed(2)
    }
    return acc
  }, {} as Record<string, { symbol: string, balance: string, usdValue: string }>)
}

export const handlers = [
    http.get('/api/wallet/balances', async ({ request }) => {
        const url = new URL(request.url)
        const provider = url.searchParams.get('provider') || 'metamask'
        const address = url.searchParams.get('address') || '0x0000000000000000000000000000000000000000'

        // sus out any race conditions
        await delay(500)

        return HttpResponse.json({
            address,
            provider,
            balances: generateBalances(address, provider)
        }, { status: 200 })
    })
]