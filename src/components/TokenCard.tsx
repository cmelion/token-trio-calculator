
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
    <Card className="w-full h-[180px] shadow-xl border border-primary/30 bg-black/40 backdrop-blur-md hover:shadow-primary/10 hover:border-primary/50 transition-all duration-200">
      <CardContent className="flex flex-col h-full p-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-white">
            {isSource ? "You pay" : "You receive"}
          </span>
          {token && (
            <span className="text-xs text-primary/80 font-semibold">
              {`1 ${token.symbol} ≈ $${token.price?.toFixed(2) ?? "0.00"}`}
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
            className="text-xl font-bold bg-transparent border-none h-12 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-white/50"
          />
          
          <button
            onClick={onTokenSelect}
            className="flex items-center gap-2 px-3 py-2 bg-primary/20 hover:bg-primary/30 transition-colors rounded-md border border-primary/30"
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

        <div className="mt-auto text-sm text-white/80">
          {token ? `Balance: ${token.symbol}` : "Select a token"}
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenCard;
