
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TokenInfo } from "@/lib/api";

interface TokenSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (token: TokenInfo) => void;
  tokens: TokenInfo[];
  selectedToken?: TokenInfo | null;
}

const TokenSelector = ({
  open,
  onClose,
  onSelect,
  tokens,
  selectedToken,
}: TokenSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredTokens = tokens.filter((token) =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset search when dialog opens
  useEffect(() => {
    if (open) {
      setSearchQuery("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md bg-black/70 backdrop-blur-xl border border-primary/30 shadow-lg shadow-primary/20">
        <DialogHeader>
          <DialogTitle className="text-xl text-white font-bold">Select a token</DialogTitle>
        </DialogHeader>
        <div className="p-1">
          <Input
            placeholder="Search by name or symbol"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4 bg-white/10 border-primary/30 text-white"
          />
          
          <ScrollArea className="h-[300px] rounded-md border border-primary/30 p-2">
            <div className="space-y-1 pr-2">
              {filteredTokens.length > 0 ? (
                filteredTokens.map((token) => (
                  <button
                    key={token.id}
                    className={`w-full flex items-center gap-3 p-3 rounded-md hover:bg-primary/20 transition-colors ${
                      selectedToken?.id === token.id ? "bg-primary/30" : ""
                    }`}
                    onClick={() => {
                      onSelect(token);
                      onClose();
                    }}
                  >
                    {token.logoURI ? (
                      <img 
                        src={token.logoURI} 
                        alt={token.name} 
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center text-white">
                        {token.symbol[0]}
                      </div>
                    )}
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-white">{token.symbol}</span>
                      <span className="text-xs text-primary/80">{token.name}</span>
                    </div>
                    <div className="ml-auto text-sm font-semibold text-white">
                      ${token.price?.toFixed(2) ?? "0.00"}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-4 text-white">
                  No tokens found
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TokenSelector;
