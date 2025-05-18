// src/components/TokenCard.tsx
import { ArrowDownUp, DollarSign } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useWallet } from "@/components/providers/wallet";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useTokenInfo } from "@/hooks/use-tokens";
import { TokenInfo } from "@/lib/api";

/**
 * TokenCard Component
 * 
 * A flexible component for displaying and interacting with cryptocurrency tokens.
 * This component allows users to input token amounts in either USD or token units,
 * with real-time conversion between the two formats.
 * 
 * Design Decisions:
 * - Callback pattern vs useEffect:
 *   We've chosen to use callbacks (like onSuccess in useTokenInfo) rather than
 *   useEffect hooks for handling reactive data updates. This provides several benefits:
 *   1. More declarative code - effects happen directly where data changes
 *   2. Fewer dependency array issues and potential for stale closures
 *   3. Clearer data flow throughout the component
 *   4. Prevents unnecessary re-renders and potential render loops
 * 
 * - State architecture:
 *   The component maintains two parallel value pathways:
 *   1. Internal display value (controlled by inputMode)
 *   2. External value (always in USD for consistent parent state)
 *   This separation allows for flexible display while keeping parent components
 *   simple by always providing values in a consistent format.
 */
interface TokenCardProps {
  token: TokenInfo | null
  value: string
  onChange: (value: string, isUsdValue: boolean) => void
  onTokenSelect: () => void
  onPriceUpdate?: (token: TokenInfo) => void
  isSource?: boolean
  disabled?: boolean
}

const TokenCard = ({
  token,
  value,
  onChange,
  onTokenSelect,
  onPriceUpdate,
  isSource = false,
  disabled = false,
}: TokenCardProps) => {
  /**
   * Get token decimals with a fallback value.
   * Extracted to a callback for reuse and to avoid dependency issues in useMemo hooks.
   */
  const getTokenDecimals = useCallback(() => {
    return token?.decimals || 8 // Default to 8 if not specified
  }, [token?.decimals])

  /**
   * Fetch live token data using our custom hook.
   * 
   * Important design decision: We use the onSuccess callback pattern instead of useEffect
   * to update token prices. This is more efficient because:
   * 1. It only runs when new data arrives (not on every render)
   * 2. It avoids dependency array management issues common with useEffect
   * 3. It creates a clearer data flow path (data arrives → callback runs)
   */
  const { data: liveToken } = useTokenInfo(
    token?.symbol || "",
    token?.chainId || "1",
    {
      onSuccess: (data: { price: number }) => {
        // Update price when live token data changes
        if (
          data?.price &&
          token &&
          data.price !== token.price &&
          onPriceUpdate
        ) {
          onPriceUpdate({ ...token, price: data.price })
        }
      },
    },
  )

  /**
   * Create a merged token object that combines the original token data
   * with the latest price information from our live data feed.
   * 
   * Using useMemo here is critical for performance as it prevents 
   * unnecessary recalculations when other state changes.
   */
  const currentToken = useMemo(() => token
    ? {
        ...token,
        // Use the live token price when available, otherwise use the original price
        price: liveToken?.price ?? token.price,
      }
    : null,
    [token, liveToken?.price]
  )

  // State for tracking whether the user is inputting in token units or USD
  const [inputMode, setInputMode] = useState<"token" | "usd">("usd")
  const { wallet } = useWallet()
  const { toast, dismiss } = useToast()
  // Track last warning time to prevent spamming the user with balance warnings
  const [lastWarningTime, setLastWarningTime] = useState(0)

  /**
   * Calculate the displayed input value based on the current inputMode.
   * 
   * Using useMemo for this calculation ensures we only recalculate when
   * the dependencies change, not on every render. This improves performance
   * especially during rapid input changes.
   */
  const inputValue = useMemo(() => {
    if (!token || !value) return ""
    
    if (inputMode === "token" && token.price > 0) {
      const usdValue = parseFloat(value)
      if (!isNaN(usdValue)) {
        return (usdValue / token.price).toFixed(getTokenDecimals())
      }
    } 
    return value
  }, [value, token, inputMode, getTokenDecimals])

  /**
   * Calculate the secondary display value shown below the input field.
   * This provides real-time conversion between USD and token amounts.
   * 
   * Using useMemo for this calculation prevents unnecessary recalculations
   * on every render, only updating when the input value or token changes.
   */
  const secondaryValue = useMemo(() => {
    if (!token || !inputValue) return ""

    try {
      if (inputMode === "token") {
        // Show USD value when in token mode, rounded up to nearest penny
        const tokenAmount = parseFloat(inputValue)
        if (isNaN(tokenAmount)) return ""
        return `≈ $${(Math.ceil(tokenAmount * token.price * 100) / 100).toFixed(2)}`
      } else if (inputMode === "usd") {
        // Show token amount when in USD mode
        const usdAmount = parseFloat(inputValue)
        if (isNaN(usdAmount) || token.price <= 0) return ""
        return `≈ ${(usdAmount / token.price).toFixed(getTokenDecimals())} ${token.symbol}`
      }
      return ""
    } catch (error) {
      console.error("Error calculating secondary value:", error)
      return ""
    }
  }, [token, inputValue, inputMode, getTokenDecimals])

  const validateBalance = useCallback(
    (enteredValue: string) => {
      if (!token || !wallet) return

      const tokenBalance = wallet.balances[token.symbol]
      if (!tokenBalance) return

      const now = Date.now()
      // Limit warnings to once every 3 seconds
      if (now - lastWarningTime < 3000) return

      try {
        let tokenAmount: number

        if (inputMode === "token") {
          // Direct token amount comparison
          tokenAmount = parseFloat(enteredValue)
        } else {
          // Convert USD to token amount for comparison
          const usdAmount = parseFloat(enteredValue)
          tokenAmount = usdAmount / token.price
        }

        const userBalance = parseFloat(tokenBalance.balance)

        if (
          !isNaN(tokenAmount) &&
          !isNaN(userBalance) &&
          tokenAmount > userBalance
        ) {
          setLastWarningTime(now)
          
          // Dismiss all existing toasts
          dismiss()
          
          // Then show the new toast
          toast({
            title: "Insufficient balance",
            description: `Your ${token.symbol} balance (${userBalance.toFixed(6)}) is less than the amount you're trying to spend (${tokenAmount.toFixed(6)})`,
            variant: "destructive",
            duration: 10000,
          })
        }
      } catch (error) {
        console.error("Error validating balance:", error)
      }
    },
    [token, wallet, lastWarningTime, setLastWarningTime, toast, inputMode, dismiss],
  )

  /**
   * Handle input changes with proper validation and formatting.
   * 
   * This approach handles several complex concerns:
   * 1. Input validation to ensure only valid numbers are entered
   * 2. Enforcing decimal precision limits based on token decimals
   * 3. Converting between display value and the consistent USD value for parent components
   * 4. Validating user balance when appropriate
   * 
   * We chose not to use useEffect here because the transformation and validation
   * need to happen immediately on input, not after a render cycle. This creates
   * a more responsive user experience with no visible input lag.
   */
  const handleInputChange = (newValue: string) => {
    // Limit USD input to 2 decimal places
    if (inputMode === "usd" && newValue.includes(".")) {
      const parts = newValue.split(".")
      if (parts[1] && parts[1].length > 2) {
        return // Prevent input with more than 2 decimal places in USD mode
      }
    }

    // Limit token input to token-specific decimal places
    if (inputMode === "token" && newValue.includes(".")) {
      const parts = newValue.split(".")
      const maxDecimals = getTokenDecimals()
      if (parts[1] && parts[1].length > maxDecimals) {
        return // Prevent input with more decimals than the token supports
      }
    }

    // Only allow numbers and decimals
    if (newValue === "" || /^[0-9]*\.?[0-9]*$/.test(newValue)) {
      if (inputMode === "token" && token) {
        // Convert token amount to USD for parent component
        try {
          const tokenAmount = parseFloat(newValue)
          if (!isNaN(tokenAmount) && token.price) {
            // Round up to nearest penny when converting token to USD
            const usdValue = (
              Math.ceil(tokenAmount * token.price * 100) / 100
            ).toFixed(2)
            onChange(usdValue, true)
          } else {
            onChange("", true)
          }
        } catch (error) {
          console.error("Error converting token to USD:", error)
          onChange("", true)
        }
      } else {
        // In USD mode, pass value directly
        onChange(newValue, true)
      }

      // Validate balance for source card
      if (isSource && newValue && token && wallet) {
        validateBalance(newValue)
      }
    }
  }

  /**
   * Toggle between USD and token input modes.
   * 
   * This function handles the conversion between modes and ensures that
   * the parent component always receives values in USD format regardless
   * of the current display mode. This creates a consistent API for parent
   * components while allowing flexible display options.
   */
  const toggleInputMode = () => {
    if (inputMode === "token") {
      // Switching from token to USD mode
      setInputMode("usd")
      if (currentToken && inputValue) {
        const tokenAmount = parseFloat(inputValue)
        if (!isNaN(tokenAmount)) {
          // Convert token to USD value for parent
          const usdValue = (Math.ceil(tokenAmount * currentToken.price * 100) / 100).toFixed(2)
          onChange(usdValue, true)
        }
      }
    } else {
      // Switching from USD to token mode
      setInputMode("token")
      if (currentToken && value) {
        const usdAmount = parseFloat(value)
        if (!isNaN(usdAmount)) {
          // The actual input value will be derived in the useMemo above
          // Keep the USD value in parent component
          onChange(value, true)
        }
      }
    }
  }

  /**
   * Get formatted token balance string for display.
   * 
   * This helper function centralizes the formatting logic for token balances,
   * making it easier to maintain consistent formatting throughout the component.
   */
  const getTokenBalance = () => {
    if (!token || !wallet) return `0.00 ${token?.symbol || ""}`

    const tokenBalance = wallet.balances[token.symbol]
    if (tokenBalance) {
      return `${tokenBalance.balance} ${token.symbol} ($${tokenBalance.usdValue})`
    } else {
      return `0.00 ${token.symbol}`
    }
  }

  return (
    <Card className="w-full md:w-[400px] lg:w-[450px] h-[187px] mx-auto shadow-xl border border-primary/30 bg-black/40 backdrop-blur-md hover:shadow-primary/10 hover:border-primary/50 transition-all duration-200">
      <CardContent className="flex flex-col h-full p-3">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-white">
            {isSource ? "You pay" : "You receive"}
          </span>
          {token && (
            <span
              className="text-xs text-primary font-semibold"
              aria-label={`${isSource ? "Source" : "Target"} token exchange rate: 1 ${token.symbol} equals approximately ${currentToken?.price?.toFixed(2) ?? "0.00"} US dollars`}
            >
              {`1 ${token.symbol} ≈ $${currentToken?.price?.toFixed(2) ?? "0.00"}`}
            </span>
          )}
        </div>

        <div className="flex flex-col mb-0">
          <div className="relative flex items-center">
            <Input
              type="text"
              placeholder={
                inputMode === "usd"
                  ? "0.00"
                  : `0.${"0".repeat(getTokenDecimals())}`
              }
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              disabled={disabled}
              aria-label={`${isSource ? "Source" : "Target"} ${inputMode === "usd" ? "USD" : "token"} amount`}
              className="text-2xl md:text-3xl lg:text-4xl font-bold bg-transparent border-none h-14 p-0 pl-7 pr-24 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-white/50 w-full overflow-x-auto"
            />
            <div className="absolute left-0 flex items-center">
              {inputMode === "usd" ? (
                <DollarSign className="h-5 w-5 text-white" />
              ) : token ? (
                token.logoURI ? (
                  <img
                    src={token.logoURI}
                    alt={token.symbol}
                    className="w-5 h-5 rounded-full"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                    }}
                  />
                ) : (
                  <img
                    src={`/asset/erc20/${token.symbol}.png`}
                    alt={token.symbol}
                    className="w-5 h-5 rounded-full"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                    }}
                  />
                )
              ) : null}
            </div>
            <button
              onClick={onTokenSelect}
              aria-label={
                token ? `Change ${token.symbol} token` : "Select token"
              }
              className="absolute right-0 flex items-center gap-1 px-2 py-1 bg-primary/20 hover:bg-primary/30 transition-colors rounded-md border border-primary/30 text-sm"
            >
              {token ? (
                <>
                  {token.logoURI && (
                    <img
                      src={token.logoURI}
                      alt={token.name}
                      className="w-4 h-4 rounded-full"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                      }}
                    />
                  )}
                  <span className="font-medium text-white" title={token.name}>
                    {token.symbol}
                  </span>
                </>
              ) : (
                <span className="text-white">Select token</span>
              )}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>

          <div className="flex items-center mt-0 gap-1">
            <button
              onClick={toggleInputMode}
              aria-label={`Switch to ${inputMode === "token" ? "USD" : "token"} input mode`}
              className="flex items-center justify-center p-1 mr-0.5 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors border border-primary/30"
            >
              <ArrowDownUp className="w-3 h-3 text-primary" />
            </button>
            <div className="text-sm text-primary/80 font-medium">
              {secondaryValue ||
                `≈ 0 ${inputMode === "token" ? "USD" : token?.symbol || ""}`}
            </div>
          </div>
        </div>

        <div className="mt-auto text-xs text-white/80">
          {token ? `Balance: ${getTokenBalance()}` : "Select a token"}
        </div>
      </CardContent>
    </Card>
  )
}

export default TokenCard