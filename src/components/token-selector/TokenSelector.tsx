import { useEffect, useState } from "react"
import {
  DialogDescription,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx"
import { Input } from "@/components/ui/input.tsx"
import { ScrollArea } from "@/components/ui/scroll-area.tsx"
import { TokenInfo } from "@/lib/api.ts"

interface TokenSelectorProps {
  open: boolean
  onClose: () => void
  onSelect: (token: TokenInfo) => void
  tokens: TokenInfo[]
  selectedToken?: TokenInfo | null
  isSelectingSource?: boolean
}

const TokenSelector = ({
  open,
  onClose,
  onSelect,
  tokens,
  selectedToken,
  isSelectingSource = false,
}: TokenSelectorProps) => {
  // Reset search when dialog opens or closes
  const [searchQuery, setSearchQuery] = useState("")

  // Reset search when the dialog opens
  // This is a legitimate use of useEffect - handling a side effect based on prop changes
  useEffect(() => {
    if (open) {
      setSearchQuery("")
    }
  }, [open])

  const filteredTokens = tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="w-[90vw] max-w-md mx-auto sm:max-w-md bg-black/70 backdrop-blur-xl border border-primary/30 shadow-lg shadow-primary/20"
        id={
          isSelectingSource ? "source-token-selector" : "target-token-selector"
        }
      >
        <DialogHeader>
          <DialogTitle className="text-xl text-white font-bold">
            Select a token
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Choose a token from the list below to continue
          </DialogDescription>
        </DialogHeader>
        <div className="p-1">
          <Input
            placeholder="Search by name or symbol"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search tokens"
            className="mb-4 bg-white/10 border-primary/30 text-white"
          />

          <ScrollArea className="h-[50vh] sm:h-[300px] rounded-md border border-primary/30 p-2">
            <div className="space-y-1 pr-2">
              {filteredTokens.length > 0 ? (
                filteredTokens.map((token) => (
                  <button
                    key={token.id}
                    aria-label={`Select ${token.symbol} - ${token.name}`}
                    className={`w-full flex items-center gap-3 p-3 rounded-md hover:bg-primary/20 transition-colors ${
                      selectedToken?.id === token.id ? "bg-primary/30" : ""
                    }`}
                    onClick={() => {
                      onSelect(token)
                      onClose()
                    }}
                  >
                    {token.logoURI ? (
                      <img
                        src={token.logoURI}
                        alt={token.name}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src =
                            "/placeholder.svg"
                        }}
                      />
                    ) : (
                      <img
                        src={`/asset/erc20/${token.symbol}.png`}
                        alt={token.symbol}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src =
                            "/placeholder.svg"
                        }}
                      />
                    )}
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-white">
                        {token.symbol}
                      </span>
                      <span className="text-xs text-primary/80">
                        {token.name}
                      </span>
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
  )
}

export default TokenSelector
