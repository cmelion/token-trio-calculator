// src/components/TokenCard.tsx
import { ArrowDownUp, DollarSign } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useWallet } from "@/components/providers/wallet"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useTokenInfo } from "@/hooks/use-tokens"
import { TokenInfo } from "@/lib/api"

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
  // Only fetch live data if we have a token
  const { data: liveToken } = useTokenInfo(
    token?.symbol || "",
    token?.chainId || "1",
  )

  // Create a merged token that takes properties from the prop token but price from live data
  const currentToken = token
    ? {
        ...token,
        // Use the live token price when available, otherwise use the original price
        price: liveToken?.price ?? token.price,
      }
    : null

  const [inputMode, setInputMode] = useState<"token" | "usd">("usd")
  const { wallet } = useWallet()
  const { toast } = useToast()
  const [lastWarningTime, setLastWarningTime] = useState(0)
  const [inputValue, setInputValue] = useState("") // Local state to track actual input value
  // Memoize validateBalance to avoid recreation on each render
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
          toast({
            title: "Insufficient balance",
            description: `Your ${token.symbol} balance (${userBalance.toFixed(6)}) is less than the amount you're trying to spend (${tokenAmount.toFixed(6)})`,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error validating balance:", error)
      }
    },
    [token, wallet, lastWarningTime, setLastWarningTime, toast, inputMode],
  )

  // Update local input value when parent value changes and handle price updates
  useEffect(() => {
    // Handle input value updates
    if (token && value) {
      if (inputMode === "token" && token.price > 0) {
        const usdValue = parseFloat(value)
        if (!isNaN(usdValue)) {
          setInputValue((usdValue / token.price).toFixed(6))
        }
      } else {
        setInputValue(value)
      }
    } else {
      setInputValue("")
    }

    // Handle price updates when live token data changes
    if (
      liveToken?.price &&
      token &&
      liveToken.price !== token.price &&
      onPriceUpdate
    ) {
      onPriceUpdate({ ...token, price: liveToken.price })
    }
  }, [value, token, inputMode, liveToken, onPriceUpdate])

  // Validate balance whenever relevant values change
  useEffect(() => {
    if (isSource && token && wallet && inputValue) {
      validateBalance(inputValue)
    }
  }, [value, token, wallet, isSource, inputMode, inputValue, validateBalance])

  const getTokenDecimals = () => {
    return token?.decimals || 8 // Default to 8 if not specified
  }

  // Update handleInputChange to limit token decimals appropriately
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
      setInputValue(newValue)

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

  // Update getSecondaryValue to use token-specific decimals
  const getSecondaryValue = () => {
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
  }

  // Update toggleInputMode to use token-specific decimals and round up USD
  const toggleInputMode = () => {
    if (inputMode === "token") {
      // Switching from token to USD mode
      setInputMode("usd")
      if (currentToken && inputValue) {
        const tokenAmount = parseFloat(inputValue)
        if (!isNaN(tokenAmount)) {
          // Update local input with USD value, rounded up to nearest penny
          setInputValue(
            (Math.ceil(tokenAmount * currentToken.price * 100) / 100).toFixed(
              2,
            ),
          )
        }
      }
    } else {
      // Switching from USD to token mode
      setInputMode("token")
      if (currentToken && inputValue) {
        const usdAmount = parseFloat(inputValue)
        if (!isNaN(usdAmount)) {
          // Update local input with token value using token-specific decimals
          setInputValue(
            (usdAmount / currentToken.price).toFixed(getTokenDecimals()),
          )
        }
      }
    }
  }

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
              {getSecondaryValue() ||
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