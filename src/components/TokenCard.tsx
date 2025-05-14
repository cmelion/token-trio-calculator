
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TokenInfo } from "@/lib/api";

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
  return (
    <Card className="w-full h-[180px] shadow-lg border-2 border-muted/20 bg-black/20 backdrop-blur-md">
      <CardContent className="flex flex-col h-full p-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            {isSource ? "You pay" : "You receive"}
          </span>
          {token && (
            <span className="text-xs text-muted-foreground">
              {`1 ${token.symbol} ≈ $${token.price.toFixed(2)}`}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-4 mt-2">
          <Input
            type="text"
            placeholder="0.0"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="text-xl font-medium bg-transparent border-none h-12 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          
          <button
            onClick={onTokenSelect}
            className="flex items-center gap-2 px-3 py-2 bg-muted/30 hover:bg-muted/50 transition-colors rounded-md"
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
                <span className="font-medium">{token.symbol}</span>
              </>
            ) : (
              <span>Select token</span>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
        </div>

        <div className="mt-auto text-sm text-muted-foreground">
          {token ? `Balance: ${token.symbol}` : "Select a token"}
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenCard;
