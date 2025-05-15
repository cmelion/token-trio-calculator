// src/components/TokenCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TokenInfo } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
import { ArrowDownUp, DollarSign } from "lucide-react";
import { useWallet } from "@/components/providers/wallet";
import { useToast } from "@/components/ui/use-toast";

interface TokenCardProps {
  token: TokenInfo | null;
  value: string;
  onChange: (value: string, isUsdValue: boolean) => void;
  onTokenSelect: () => void;
  isSource?: boolean;
  disabled?: boolean;
}

const TokenCard = ({
                     token,
                     value,
                     onChange,
                     onTokenSelect,
                     isSource = false,
                     disabled = false
                   }: TokenCardProps) => {
  const [inputMode, setInputMode] = useState<"token" | "usd">("usd");
  const { wallet } = useWallet();
  const { toast } = useToast();
  const [lastWarningTime, setLastWarningTime] = useState(0);
  const [inputValue, setInputValue] = useState(""); // Local state to track actual input value
  // Memoize validateBalance to avoid recreation on each render
  const validateBalance = useCallback((enteredValue: string) => {
    if (!token || !wallet) return;

    const tokenBalance = wallet.balances[token.symbol];
    if (!tokenBalance) return;

    const now = Date.now();
    // Limit warnings to once every 3 seconds
    if (now - lastWarningTime < 3000) return;

    try {
      let tokenAmount: number;

      if (inputMode === "token") {
        // Direct token amount comparison
        tokenAmount = parseFloat(enteredValue);
      } else {
        // Convert USD to token amount for comparison
        const usdAmount = parseFloat(enteredValue);
        tokenAmount = usdAmount / token.price;
      }

      const userBalance = parseFloat(tokenBalance.balance);

      if (!isNaN(tokenAmount) && !isNaN(userBalance) && tokenAmount > userBalance) {
        setLastWarningTime(now);
        toast({
          title: "Insufficient balance",
          description: `Your ${token.symbol} balance (${userBalance.toFixed(6)}) is less than the amount you're trying to spend (${tokenAmount.toFixed(6)})`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error validating balance:", error);
    }
  }, [token, wallet, lastWarningTime, setLastWarningTime, toast, inputMode]);

  // Update local input value when parent value changes
  useEffect(() => {
    if (token && value) {
      if (inputMode === "token" && token.price > 0) {
        const usdValue = parseFloat(value);
        if (!isNaN(usdValue)) {
          setInputValue((usdValue / token.price).toFixed(6));
        }
      } else {
        setInputValue(value);
      }
    } else {
      setInputValue("");
    }
  }, [value, token, inputMode]);

  // Validate balance whenever relevant values change
  useEffect(() => {
    if (isSource && token && wallet && inputValue) {
      validateBalance(inputValue);
    }
  }, [value, token, wallet, isSource, inputMode, inputValue, validateBalance]);

  const handleInputChange = (newValue: string) => {
    // Only allow numbers and decimals
    if (newValue === "" || /^[0-9]*\.?[0-9]*$/.test(newValue)) {
      setInputValue(newValue);

      if (inputMode === "token" && token) {
        // Convert token amount to USD for parent component
        try {
          const tokenAmount = parseFloat(newValue);
          if (!isNaN(tokenAmount) && token.price) {
            const usdValue = (tokenAmount * token.price).toFixed(2);
            onChange(usdValue, true);
          } else {
            onChange("", true);
          }
        } catch (error) {
          console.error("Error converting token to USD:", error);
          onChange("", true);
        }
      } else {
        // In USD mode, pass value directly
        onChange(newValue, true);
      }

      // Validate balance for source card
      if (isSource && newValue && token && wallet) {
        validateBalance(newValue);
      }
    }
  };

  const toggleInputMode = () => {
    if (inputMode === "token") {
      // Switching from token to USD mode
      setInputMode("usd");
      if (token && inputValue) {
        const tokenAmount = parseFloat(inputValue);
        if (!isNaN(tokenAmount)) {
          // Update local input with USD value
          setInputValue((tokenAmount * token.price).toFixed(2));
        }
      }
    } else {
      // Switching from USD to token mode
      setInputMode("token");
      if (token && inputValue) {
        const usdAmount = parseFloat(inputValue);
        if (!isNaN(usdAmount)) {
          // Update local input with token value
          setInputValue((usdAmount / token.price).toFixed(6));
        }
      }
    }
  };

  const getSecondaryValue = () => {
    if (!token || !inputValue) return "";

    try {
      if (inputMode === "token") {
        // Show USD value when in token mode
        const tokenAmount = parseFloat(inputValue);
        if (isNaN(tokenAmount)) return "";
        return `≈ $${(tokenAmount * token.price).toFixed(2)}`;
      } else if (inputMode === "usd") {
        // Show token amount when in USD mode
        const usdAmount = parseFloat(inputValue);
        if (isNaN(usdAmount) || token.price <= 0) return "";
        return `≈ ${(usdAmount / token.price).toFixed(6)} ${token.symbol}`;
      }
      return "";
    } catch (error) {
      console.error("Error calculating secondary value:", error);
      return "";
    }
  };

  const getTokenBalance = () => {
    if (!token || !wallet) return `0.00 ${token?.symbol || ""}`;

    const tokenBalance = wallet.balances[token.symbol];
    if (tokenBalance) {
      return `${tokenBalance.balance} ${token.symbol} ($${tokenBalance.usdValue})`;
    } else {
      return `0.00 ${token.symbol}`;
    }
  };

  return (
      <Card className="w-full md:w-[400px] lg:w-[450px] h-[187px] mx-auto shadow-xl border border-primary/30 bg-black/40 backdrop-blur-md hover:shadow-primary/10 hover:border-primary/50 transition-all duration-200">
        <CardContent className="flex flex-col h-full p-3">
          <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-white">
            {isSource ? "You pay" : "You receive"}
          </span>
            {token && (
                <span className="text-xs text-primary font-semibold">
              {`1 ${token.symbol} ≈ $${token.price?.toFixed(2) ?? "0.00"}`}
            </span>
            )}
          </div>

          <div className="flex flex-col mb-0">
            <div className="relative flex items-center">
              <Input
                  type="text"
                  placeholder="0.0"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  disabled={disabled}
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
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                        />
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{token.symbol[0]}</span>
                        </div>
                    )
                ) : null}
              </div>
              <button
                  onClick={onTokenSelect}
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
                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                              }}
                          />
                      )}
                      <span className="font-medium text-white" title={token.name}>{token.symbol}</span>
                    </>
                ) : (
                    <span className="text-white">Select token</span>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
            </div>

            <div className="flex items-center mt-0 gap-1">
              <button
                  onClick={toggleInputMode}
                  className="flex items-center justify-center p-1 mr-0.5 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors border border-primary/30"
              >
                <ArrowDownUp className="w-3 h-3 text-primary" />
              </button>
              <div className="text-sm text-primary/80 font-medium">
                {getSecondaryValue() || `≈ 0 ${inputMode === "token" ? "USD" : token?.symbol || ""}`}
              </div>
            </div>
          </div>

          <div className="mt-auto text-xs text-white/80">
            {token ? `Balance: ${getTokenBalance()}` : "Select a token"}
          </div>
        </CardContent>
      </Card>
  );
};

export default TokenCard;