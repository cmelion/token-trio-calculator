
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TokenInfo } from "@/lib/api";
import { useState } from "react";
import { ArrowDownUp, DollarSign } from "lucide-react";

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
  // Default to USD mode
  const [inputMode, setInputMode] = useState<"token" | "usd">("usd");

  const handleInputChange = (newValue: string) => {
    // Only allow numbers and decimals
    if (newValue === "" || /^[0-9]*\.?[0-9]*$/.test(newValue)) {
      onChange(newValue);
    }
  };

  // Toggle between token and USD mode
  const toggleInputMode = () => {
    setInputMode(inputMode === "token" ? "usd" : "token");
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
        
        <div className="flex flex-col mb-2">
          <div className="relative flex items-center">
            <Input
              type="text"
              placeholder="0.0"
              value={displayValue()}
              onChange={(e) => handleInputChange(e.target.value)}
              disabled={disabled}
              className={`text-4xl font-bold bg-transparent border-none h-16 p-0 ${inputMode === "usd" ? "pl-8" : "pl-0"} focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-white/50`}
            />
            {inputMode === "usd" && (
              <span className="absolute left-0 text-4xl font-bold text-white">
                <DollarSign className="h-7 w-7" />
              </span>
            )}
            {inputMode === "token" && token && (
              <div className="absolute left-0 flex items-center">
                {token.logoURI ? (
                  <img 
                    src={token.logoURI} 
                    alt={token.symbol} 
                    className="w-7 h-7 rounded-full" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/30 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{token.symbol[0]}</span>
                  </div>
                )}
              </div>
            )}
            <span className="ml-2 text-4xl font-bold text-white">
              {inputMode === "token" ? token?.symbol || "" : ""}
            </span>
            <button
              onClick={onTokenSelect}
              className="ml-auto flex items-center gap-2 px-3 py-2 bg-primary/20 hover:bg-primary/30 transition-colors rounded-md border border-primary/30"
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

          <div className="flex items-center mt-2">
            <button 
              onClick={toggleInputMode}
              className="flex items-center justify-center p-1 mr-2 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors border border-primary/30"
            >
              <ArrowDownUp className="w-3 h-3 text-primary" />
            </button>
            <div className="text-sm text-primary/80 font-medium">
              {token && value ? getSecondaryValue() : `≈ 0 ${inputMode === "token" ? "USD" : token?.symbol || ""}`}
            </div>
          </div>
        </div>

        <div className="mt-auto text-sm text-white/80">
          {token ? `Balance: 0.00 ${token.symbol}` : "Select a token"}
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenCard;
