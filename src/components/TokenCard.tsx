
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TokenInfo } from "@/lib/api";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface TokenCardProps {
  token: TokenInfo | null;
  value: string;
  onChange: (value: string) => void;
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
  const [inputMode, setInputMode] = useState<"token" | "usd">("token");

  const handleInputChange = (newValue: string) => {
    // Only allow numbers and decimals
    if (newValue === "" || /^[0-9]*\.?[0-9]*$/.test(newValue)) {
      onChange(newValue);
    }
  };

  // Format displayed value based on input mode
  const displayValue = () => {
    if (!token || !value) return "";

    if (inputMode === "token") {
      return value;
    } else {
      try {
        // If in USD mode, convert token value to USD equivalent
        const tokenAmount = parseFloat(value);
        if (!isNaN(tokenAmount) && token.price) {
          return (tokenAmount * token.price).toFixed(2);
        }
        return "";
      } catch (error) {
        console.error("Error calculating USD value:", error);
        return "";
      }
    }
  };

  // Get the secondary display value (the conversion info)
  const getSecondaryValue = () => {
    if (!token || !value) return "";

    try {
      const amount = parseFloat(value);
      if (isNaN(amount)) return "";

      if (inputMode === "token" && token.price) {
        // Show USD value
        return `≈ $${(amount * token.price).toFixed(2)}`;
      } else if (inputMode === "usd" && token.price && token.price > 0) {
        // Show token amount
        return `≈ ${(amount / token.price).toFixed(6)} ${token.symbol}`;
      }
      return "";
    } catch (error) {
      console.error("Error calculating secondary value:", error);
      return "";
    }
  };

  return (
    <Card className="w-full h-[200px] shadow-xl border border-primary/30 bg-black/40 backdrop-blur-md hover:shadow-primary/10 hover:border-primary/50 transition-all duration-200">
      <CardContent className="flex flex-col h-full p-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-white">
            {isSource ? "You pay" : "You receive"}
          </span>
          {token && (
            <span className="text-xs text-primary font-semibold">
              {`1 ${token.symbol} ≈ $${token.price?.toFixed(2) ?? "0.00"}`}
            </span>
          )}
        </div>
        
        {token && (
          <div className="mb-3">
            <ToggleGroup 
              type="single" 
              value={inputMode} 
              onValueChange={(value) => {
                if (value) setInputMode(value as "token" | "usd");
              }}
              className="w-full md:w-auto bg-black/30 rounded-full p-1 border border-primary/20"
            >
              <ToggleGroupItem 
                value="token" 
                className="flex-1 rounded-full text-sm font-medium data-[state=on]:bg-white data-[state=on]:text-black data-[state=off]:text-white/80"
              >
                {token.symbol}
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="usd" 
                className="flex-1 rounded-full text-sm font-medium data-[state=on]:bg-white data-[state=on]:text-black data-[state=off]:text-white/80"
              >
                USD
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}
        
        <div className="flex flex-col mb-2">
          <div className="relative flex items-center">
            <Input
              type="text"
              placeholder="0.0"
              value={displayValue()}
              onChange={(e) => handleInputChange(e.target.value)}
              disabled={disabled}
              className="text-3xl font-bold bg-transparent border-none h-14 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-white/50"
            />
            {inputMode === "usd" && (
              <span className="absolute left-0 text-3xl font-bold text-white">$</span>
            )}
            <button
              onClick={onTokenSelect}
              className="ml-2 flex items-center gap-2 px-3 py-2 bg-primary/20 hover:bg-primary/30 transition-colors rounded-md border border-primary/30"
            >
              {token ? (
                <>
                  {token.logoURI && (
                    <img 
                      src={token.logoURI} 
                      alt={token.name} 
                      className="w-5 h-5 rounded-full" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }} 
                    />
                  )}
                  <span className="font-medium text-white">{token.symbol}</span>
                </>
              ) : (
                <span className="text-white">Select token</span>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
          </div>

          {token && value && (
            <div className="text-sm text-primary/80 font-medium mt-1">
              {getSecondaryValue()}
            </div>
          )}
        </div>

        <div className="mt-auto text-sm text-white/80">
          {token ? `Balance: 0.00 ${token.symbol}` : "Select a token"}
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenCard;
