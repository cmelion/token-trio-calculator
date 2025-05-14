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

  // Keep both values in sync when source value changes
  useEffect(() => {
    if (sourceToken && targetToken && sourceValue) {
      try {
        const sourceAmount = parseFloat(sourceValue);
        if (!isNaN(sourceAmount)) {
          const sourceValueInUSD = sourceAmount;
          setTargetValue(sourceValueInUSD.toString());
        }
      } catch (error) {
        console.error("Error calculating swap:", error);
      }
    } else {
      setTargetValue("");
    }
  }, [sourceValue, sourceToken, targetToken]);

  // Keep both values in sync when target value changes
  useEffect(() => {
    if (sourceToken && targetToken && targetValue && !sourceValue) {
      setSourceValue(targetValue);
    }
  }, [targetValue, sourceToken, targetToken, sourceValue]);

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
    setSourceValue(newValue);
  };

  const handleTargetValueChange = (newValue: string) => {
    setTargetValue(newValue);
    setSourceValue(newValue); // Keep source and target in sync for USD values
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-lg mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent pb-2 drop-shadow-sm">
            Token Price Explorer
          </h1>
          <p className="text-white text-opacity-90 font-medium">
            Compare token values and explore potential swaps
          </p>
        </div>
        
        <div className="bg-black/50 backdrop-blur-xl rounded-xl border border-primary/30 p-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
          <div className="grid grid-cols-4 gap-2 mb-6">
            {tokens.slice(0, 4).map((token) => (
              <Button
                key={token.id}
                variant={sourceToken?.id === token.id || targetToken?.id === token.id ? "default" : "outline"}
                className={`
                  ${sourceToken?.id === token.id || targetToken?.id === token.id 
                    ? "bg-primary text-white hover:bg-primary/90" 
                    : "bg-black/30 hover:bg-primary/20 border-primary/30 text-white"}
                  transition-all duration-200 font-medium
                `}
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
              onChange={handleTargetValueChange}
              onTokenSelect={handleTargetTokenSelect}
            />
          </div>
          
          <div className="flex justify-between text-sm px-2">
            <span className="text-white font-medium">Exchange Rate:</span>
            {sourceToken && targetToken ? (
              <span className="text-primary/90 font-bold">
                1 {sourceToken.symbol} ≈ {(sourceToken.price / targetToken.price).toFixed(6)} {targetToken.symbol} (${sourceToken.price.toFixed(2)})
              </span>
            ) : (
              <span className="text-white/70">Select tokens</span>
            )}
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-white/70">
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
