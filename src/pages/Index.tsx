import { useState } from "react"
import { Toaster } from "sonner"
import { SwapArrow, TokenCard, TokenSelector } from "@/components/"
import { Button, type ButtonProps } from "@/components/ui/button"
import { useAllTokens } from "@/hooks/use-tokens"
import { TokenInfo } from "@/lib/api.ts"
import { convertTokenValueToUsd } from "@/utils/conversion"

const Index = () => {
  // Local state for tokens and their USD values.
  const [sourceValue, setSourceValue] = useState<string>("")
  const [isSelectingSource, setIsSelectingSource] = useState<boolean>(false)
  const [isSelectingTarget, setIsSelectingTarget] = useState<boolean>(false)

  // Helper functions to find default tokens
  const getDefaultSourceToken = (tokenList: TokenInfo[]) =>
    tokenList.find((t) => t.symbol === "USDC") || tokenList[0] || null

  const getDefaultTargetToken = (tokenList: TokenInfo[]) =>
    tokenList.find((t) => t.symbol === "ETH") ||
    (tokenList.length > 1 ? tokenList[1] : null)

  // Fetch tokens
  const { data: tokens = [] } = useAllTokens()

  // Instead of using useState + useEffect for initialization and updates,
  // use a useMemo pattern by defining derived state directly
  const defaultSourceToken =
    tokens.length > 0 ? getDefaultSourceToken(tokens) : null
  const defaultTargetToken =
    tokens.length > 0 ? getDefaultTargetToken(tokens) : null

  // State with proper initialization using lazy initializer
  const [sourceToken, setSourceToken] = useState<TokenInfo | null>(
    () => defaultSourceToken,
  )
  const [targetToken, setTargetToken] = useState<TokenInfo | null>(
    () => defaultTargetToken,
  )

  // Calculate target value directly as derived state (no useEffect needed)
  const calculateTargetValue = () => {
    if (sourceToken && targetToken && sourceValue) {
      try {
        const sourceUsdAmount = parseFloat(sourceValue)
        if (!isNaN(sourceUsdAmount)) {
          return sourceUsdAmount.toString()
        }
      } catch (error) {
        console.error("Error calculating swap:", error)
      }
    }
    return ""
  }

  // Trigger modal selection for tokens
  const handleSourceTokenSelect = () => setIsSelectingSource(true)
  const handleTargetTokenSelect = () => setIsSelectingTarget(true)

  /**
   * Handles token selection from the modal.
   * If the token selected is already assigned to the opposite side, swap the tokens.
   * This behavior is meant to streamline the common use-case of quickly reversing the swap direction.
   */
  const handleTokenSelect = (token: TokenInfo) => {
    if (isSelectingSource) {
      if (token.id === targetToken?.id) {
        // Swap tokens to quickly reverse the swap direction.
        setSourceToken(targetToken)
        setTargetToken(sourceToken)
      } else {
        setSourceToken(token)
      }
      setIsSelectingSource(false)
    } else if (isSelectingTarget) {
      if (token.id === sourceToken?.id) {
        // Swap tokens to quickly reverse the swap direction.
        setTargetToken(sourceToken)
        setSourceToken(token)
      } else {
        setTargetToken(token)
      }
      setIsSelectingTarget(false)
    }
  }

  /**
   * Handles changes to the source token amount.
   * If the amount is provided in USD, we simply update the state;
   * otherwise, convert the token amount to USD using the helper function.
   */
  const handleSourceValueChange = (newValue: string, isUsdValue: boolean) => {
    if (isUsdValue) {
      setSourceValue(newValue)
    } else if (sourceToken) {
      try {
        // Convert using the helper function to keep logic consistent.
        const usdValue = convertTokenValueToUsd(newValue, sourceToken.price)
        setSourceValue(usdValue)
      } catch (error) {
        console.error("Error converting source value:", error)
      }
    }
  }

  /**
   * Handles changes to the target token amount.
   * Synchronizes both target and source USD values for consistency.
   */
  const handleTargetValueChange = (newValue: string, isUsdValue: boolean) => {
    if (isUsdValue) {
      // Maintain synchronization between source and target when directly updating in USD.
      setSourceValue(newValue)
    } else if (targetToken) {
      try {
        const usdValue = convertTokenValueToUsd(newValue, targetToken.price)
        setSourceValue(usdValue)
      } catch (error) {
        console.error("Error converting target value:", error)
      }
    }
  }

  /**
   * Handles updates to the source token price.
   * This is useful for updating the token's price in the UI when it changes.
   */
  const handleSourcePriceUpdate = (updatedToken: TokenInfo) => {
    setSourceToken(updatedToken)
  }

  const handleTargetPriceUpdate = (updatedToken: TokenInfo) => {
    setTargetToken(updatedToken)
  }

  // If no tokens are selected but defaults are available, set them
  if (tokens.length > 0 && !sourceToken && defaultSourceToken) {
    setSourceToken(defaultSourceToken)
  }

  if (tokens.length > 0 && !targetToken && defaultTargetToken) {
    setTargetToken(defaultTargetToken)
  }

  const targetValue = calculateTargetValue()

  return (
    <div className="flex flex-col items-center justify-center p-4 pt-16 animate-fade-in h-full">
      <Toaster position="top-center" />

      <div className="w-full max-w-3xl lg:max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent pb-2 drop-shadow-sm">
            Token Price Explorer
          </h1>
          <p className="text-foreground/90 font-medium">
            Compare token values and explore potential swaps
          </p>
        </div>

        <div className="theme-card rounded-xl p-6 transition-all duration-300">
          {/* Token buttons for quick selections (up to 4) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            {tokens.slice(0, 4).map((token) => (
              <Button
                key={token.id}
                aria-label={`Quick select ${token.symbol}`}
                variant={
                  (sourceToken?.id === token.id || targetToken?.id === token.id
                    ? "default"
                    : "outline") as ButtonProps["variant"]
                }
                className={`
                  ${
                    sourceToken?.id === token.id || targetToken?.id === token.id
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-accent/20 hover:bg-primary/20 border-primary/30 text-foreground"
                  }
                  transition-all duration-200 font-medium
                `}
                onClick={() => {
                  // If the token is already selected as the source, do nothing.
                  if (sourceToken?.id === token.id) return

                  // If the token is selected as target, swap the tokens.
                  if (targetToken?.id === token.id) {
                    const temp = sourceToken
                    setSourceToken(targetToken)
                    setTargetToken(temp)
                  } else {
                    // Otherwise, set as the source token.
                    setSourceToken(token)
                  }
                }}
              >
                {token.symbol}
              </Button>
            ))}
          </div>

          {/* Responsive layout for swapping tokens */}
          <div className="flex flex-col portrait:flex-col md:flex-row landscape:flex-row items-center justify-center md:space-x-4 landscape:space-x-4 space-y-4 md:space-y-0 landscape:space-y-0 mb-6">
            <TokenCard
              token={sourceToken}
              value={sourceValue}
              onChange={handleSourceValueChange}
              onTokenSelect={handleSourceTokenSelect}
              onPriceUpdate={handleSourcePriceUpdate}
              isSource
            />

            <div className="transform portrait:rotate-90 md:rotate-0 landscape:rotate-0">
              <SwapArrow />
            </div>

            <TokenCard
              token={targetToken}
              value={targetValue}
              onChange={handleTargetValueChange}
              onTokenSelect={handleTargetTokenSelect}
              onPriceUpdate={handleTargetPriceUpdate}
            />
          </div>

          {/* Display current exchange rate when both tokens are selected */}
          <div
            className="flex justify-between text-sm px-2"
            role="region"
            aria-label="Exchange Rate Information"
          >
            <span
              id="exchange-rate-label"
              className="text-foreground font-medium"
              data-testid="exchange-rate-label"
            >
              Exchange Rate:
            </span>
            {sourceToken && targetToken ? (
              <span
                aria-labelledby="exchange-rate-label"
                className="text-primary font-bold"
                data-testid="exchange-rate-value"
              >
                1 {sourceToken.symbol} ≈{" "}
                {(sourceToken.price / targetToken.price).toFixed(6)}{" "}
                {targetToken.symbol} (${sourceToken.price.toFixed(2)})
              </span>
            ) : (
              <span
                aria-labelledby="exchange-rate-label"
                className="text-foreground/70"
                data-testid="exchange-rate-empty"
              >
                Select tokens
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-foreground/70">
          <p>
            Data provided by @funkit/api-base • Chain ID:{" "}
            {sourceToken?.chainId || "1"}
          </p>
        </div>
      </div>

      {/* Global token selector modal */}
      <TokenSelector
        open={isSelectingSource || isSelectingTarget}
        onClose={() => {
          setIsSelectingSource(false)
          setIsSelectingTarget(false)
        }}
        onSelect={handleTokenSelect}
        tokens={tokens}
        selectedToken={isSelectingSource ? sourceToken : targetToken}
        isSelectingSource={isSelectingSource}
      />
    </div>
  )
}

export default Index
