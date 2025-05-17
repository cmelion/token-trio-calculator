import { http, passthrough, HttpResponse, delay } from 'msw'
import { supportedTokens } from '@/lib/api'

/**
 * Helper function to determine if we are running inside Storybook.
 * This allows us to only mock API responses in Storybook, while passing through
 * to the real API in all other environments (e.g., development, production).
 *
 * We check for both STORYBOOK and VITE_STORYBOOK environment variables for compatibility.
 */
const isStorybook = () =>
    import.meta.env.STORYBOOK === 'true' || import.meta.env.VITE_STORYBOOK === 'true'

/**
 * Static token info for supported tokens.
 * These are used as mock responses for the token info endpoint when running in Storybook.
 * The structure matches what the real API would return, ensuring UI consistency.
 */
const staticTokenInfo = {
    USDC: {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        chain: '1',
        decimals: 6,
        name: 'USD Coin',
        symbol: 'USDC',
        logoURI: '/asset/erc20/USDC.png',
    },
    USDT: {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        chain: '1',
        decimals: 6,
        name: 'Tether',
        symbol: 'USDT',
        logoURI: '/asset/erc20/USDT.png',
    },
    ETH: {
        address: '0x0000000000000000000000000000000000000000',
        chain: '1',
        decimals: 18,
        name: 'Ethereum',
        symbol: 'ETH',
        logoURI: '/asset/erc20/ETH.png',
    },
    WBTC: {
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        chain: '1',
        decimals: 8,
        name: 'Wrapped Bitcoin',
        symbol: 'WBTC',
        logoURI: '/asset/erc20/WBTC.png',
    },
}

/**
 * Static token prices for supported tokens.
 * Used to mock the price endpoint in Storybook.
 * These values are fixed to ensure deterministic and testable UI behavior.
 */
const staticTokenPrices = {
    USDC: { unitPrice: 1.0, amount: 1, total: 1.0 },
    USDT: { unitPrice: 1.0, amount: 1, total: 1.0 },
    ETH: { unitPrice: 3000.0, amount: 1, total: 3000.0 },
    WBTC: { unitPrice: 60000.0, amount: 1, total: 60000.0 },
}

/**
 * Generates deterministic mock balances for each supported token.
 * The balance is pseudo-random but consistent for a given address and provider,
 * ensuring that Storybook stories and tests are stable and repeatable.
 *
 * @param address - Wallet address (used as a seed)
 * @param provider - Wallet provider (used as a seed)
 * @returns Object mapping token symbols to balance and USD value
 */
const generateBalances = (address: string, provider: string) => {
    const seed = address.split('').reduce((a, b) => a + b.charCodeAt(0), 0) + provider.length
    return supportedTokens.reduce((acc, token) => {
        // Generate a pseudo-random balance between 0.01 and 10, based on the seed
        const randomBalance = (((seed * token.symbol.length) % 1000) / 100) + 0.01
        acc[token.symbol] = {
            symbol: token.symbol,
            balance: randomBalance.toFixed(4),
            // USD value is calculated using the static price for each token
            usdValue: (randomBalance * (token.symbol === 'ETH' ? 3000 : token.symbol === 'WBTC' ? 60000 : 1)).toFixed(2)
        }
        return acc
    }, {} as Record<string, { symbol: string, balance: string, usdValue: string }>)
}

/**
 * MSW request handlers.
 * Each handler checks if we are in Storybook:
 *   - If yes, it returns a static mock response.
 *   - If not, it calls passthrough(), allowing the request to hit the real API.
 */
export const handlers = [
    /**
     * Handler for wallet balances endpoint.
     * Returns deterministic mock balances in Storybook, otherwise passes through.
     */
    http.get('/api/wallet/balances', async ({ request }) => {
        // Parse query params for provider and address, with sensible defaults
        const url = new URL(request.url)
        const provider = url.searchParams.get('provider') || 'metamask'
        const address = url.searchParams.get('address') || '0x0000000000000000000000000000000000000000'
        // Simulate network delay for realism
        await delay(500)
        return HttpResponse.json({
            address,
            provider,
            balances: generateBalances(address, provider)
        }, { status: 200 })
    }),

    /**
     * Handler for token info endpoint.
     * Returns static token info for supported tokens in Storybook.
     * If the symbol is not found, returns a 404.
     * Otherwise, passes through to the real API.
     */
    http.get('https://api.fun.xyz/v1/asset/erc20/:chainId/:symbol', async ({ params }) => {
        if (!isStorybook()) return passthrough()
        const { symbol } = params
        const info = staticTokenInfo[symbol as keyof typeof staticTokenInfo]
        if (!info) return HttpResponse.json({}, { status: 404 })
        return HttpResponse.json(info, { status: 200 })
    }),

    /**
     * Handler for token price endpoint.
     * Returns static price info for supported tokens in Storybook.
     * Looks up the token by address.
     * If the address is not found, returns a 404.
     * Otherwise, passes through to the real API.
     */
    http.get('https://api.fun.xyz/v1/asset/erc20/price/:chainId/:address', async ({ params }) => {
        if (!isStorybook()) return passthrough()
        const { address } = params
        // Find the symbol for the given address
        const symbol = Object.keys(staticTokenInfo).find(
            (sym) => staticTokenInfo[sym as keyof typeof staticTokenInfo].address.toLowerCase() === (address as string).toLowerCase()
        )
        const price = symbol ? staticTokenPrices[symbol as keyof typeof staticTokenPrices] : null
        if (!price) return HttpResponse.json({}, { status: 404 })
        return HttpResponse.json(price, { status: 200 })
    }),
]