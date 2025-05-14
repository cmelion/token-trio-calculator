
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
      <DialogContent className="sm:max-w-md bg-black/50 backdrop-blur-xl border-muted/30">
        <DialogHeader>
          <DialogTitle>Select a token</DialogTitle>
        </DialogHeader>
        <div className="p-1">
          <Input
            placeholder="Search by name or symbol"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4 text-white"
          />
          
          <ScrollArea className="h-[300px] rounded-md border border-muted/30 p-2">
            <div className="space-y-1 pr-2">
              {filteredTokens.length > 0 ? (
                filteredTokens.map((token) => (
                  <button
                    key={token.id}
                    className={`w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted/20 transition-colors ${
                      selectedToken?.id === token.id ? "bg-muted/30" : ""
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
                      <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center">
                        {token.symbol[0]}
                      </div>
                    )}
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{token.symbol}</span>
                      <span className="text-xs text-muted-foreground">{token.name}</span>
                    </div>
                    <div className="ml-auto text-sm">
                      ${token.price?.toFixed(2) ?? "0.00"}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
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
