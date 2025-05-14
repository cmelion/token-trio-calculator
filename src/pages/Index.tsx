import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import TokenCard from "@/components/TokenCard";
import TokenSelector from "@/components/TokenSelector";
import SwapArrow from "@/components/SwapArrow";
import { TokenInfo, fetchAllSupportedTokens } from "@/lib/api";

const Index = () => {
  const [sourceToken, setSourceToken] = useState<TokenInfo | null>(null);
  const [targetToken, setTargetToken] = useState<TokenInfo | null>(null);
  const [sourceValue, setSourceValue] = useState<string>("");
  const [targetValue, setTargetValue] = useState<string>("");
  const [isSelectingSource, setIsSelectingSource] = useState<boolean>(false);
  const [isSelectingTarget, setIsSelectingTarget] = useState<boolean>(false);

  // Fetch token data
  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ["tokens"],
    queryFn: fetchAllSupportedTokens,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update target value when source value or tokens change
  useEffect(() => {
    if (sourceToken && targetToken && sourceValue) {
      try {
        const sourceAmount = parseFloat(sourceValue);
        if (!isNaN(sourceAmount)) {
          const sourceValueInUSD = sourceAmount * sourceToken.price;
          const targetAmount = sourceValueInUSD / targetToken.price;
          setTargetValue(targetAmount.toFixed(6));
        }
      } catch (error) {
        console.error("Error calculating swap:", error);
      }
    } else {
      setTargetValue("");
    }
  }, [sourceValue, sourceToken, targetToken]);

  // Set initial tokens once loaded
  useEffect(() => {
    if (tokens.length > 0 && !sourceToken && !targetToken) {
      // Default to USDC as source and ETH as target if available
      const defaultSource = tokens.find(t => t.symbol === "USDC") || tokens[0];
      const defaultTarget = tokens.find(t => t.symbol === "ETH") || 
        (tokens.length > 1 ? tokens[1] : null);
      
      if (defaultSource) setSourceToken(defaultSource);
      if (defaultTarget) setTargetToken(defaultTarget);
    }
  }, [tokens, sourceToken, targetToken]);

  const handleSourceTokenSelect = () => {
    setIsSelectingSource(true);
  };

  const handleTargetTokenSelect = () => {
    setIsSelectingTarget(true);
  };

  const handleTokenSelect = (token: TokenInfo) => {
    if (isSelectingSource) {
      // If selecting the same token, swap the tokens
      if (token.id === targetToken?.id) {
        setSourceToken(targetToken);
        setTargetToken(sourceToken);
      } else {
        setSourceToken(token);
      }
      setIsSelectingSource(false);
    } else if (isSelectingTarget) {
      // If selecting the same token, swap the tokens
      if (token.id === sourceToken?.id) {
        setTargetToken(sourceToken);
        setSourceToken(token);
      } else {
        setTargetToken(token);
      }
      setIsSelectingTarget(false);
    }
  };

  const handleSourceValueChange = (newValue: string) => {
    // Only allow numbers and decimals
    if (newValue === "" || /^[0-9]*\.?[0-9]*$/.test(newValue)) {
      setSourceValue(newValue);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-lg mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent pb-2">
            Token Price Explorer
          </h1>
          <p className="text-muted-foreground">
            Compare token values and explore potential swaps
          </p>
        </div>
        
        <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-muted/20 p-6 shadow-lg">
          <div className="grid grid-cols-4 gap-2 mb-6">
            {tokens.slice(0, 4).map((token) => (
              <Button
                key={token.id}
                variant={sourceToken?.id === token.id || targetToken?.id === token.id ? "secondary" : "outline"}
                className="bg-muted/20 hover:bg-muted/40 border-muted/30"
                onClick={() => {
                  if (sourceToken?.id === token.id) {
                    // If already selected as source, do nothing
                    return;
                  } else if (targetToken?.id === token.id) {
                    // If already selected as target, swap
                    const temp = sourceToken;
                    setSourceToken(targetToken);
                    setTargetToken(temp);
                  } else {
                    // Otherwise set as source
                    setSourceToken(token);
                  }
                }}
              >
                {token.symbol}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center justify-center space-x-4 mb-6">
            <TokenCard
              token={sourceToken}
              value={sourceValue}
              onChange={handleSourceValueChange}
              onTokenSelect={handleSourceTokenSelect}
              isSource
            />
            
            <SwapArrow />
            
            <TokenCard
              token={targetToken}
              value={targetValue}
              onChange={() => {}} // Read-only for now
              onTokenSelect={handleTargetTokenSelect}
              disabled
            />
          </div>
          
          <div className="flex justify-between text-sm text-muted-foreground px-2">
            <span>Exchange Rate:</span>
            {sourceToken && targetToken ? (
              <span>
                1 {sourceToken.symbol} ≈ {(sourceToken.price / targetToken.price).toFixed(6)} {targetToken.symbol} (${sourceToken.price.toFixed(2)})
              </span>
            ) : (
              <span>Select tokens</span>
            )}
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Data provided by @funkit/api-base • Chain ID: {sourceToken?.chainId || "1"}</p>
        </div>
      </div>
      
      <TokenSelector
        open={isSelectingSource || isSelectingTarget}
        onClose={() => {
          setIsSelectingSource(false);
          setIsSelectingTarget(false);
        }}
        onSelect={handleTokenSelect}
        tokens={tokens}
        selectedToken={isSelectingSource ? sourceToken : targetToken}
      />
    </div>
  );
};

export default Index;
