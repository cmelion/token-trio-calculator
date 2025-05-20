// src/components/ConnectWalletButton.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog.tsx";
import { Icons } from "@/components/common/icons.tsx";
import { useWallet } from "@/components/providers/wallet";

// Use the exact union type expected by the connect function
type WalletOption =
  | { readonly name: "MetaMask"; readonly icon: "metamask" }
  | { readonly name: "WalletConnect"; readonly icon: "walletconnect" }
  | { readonly name: "Coinbase Wallet"; readonly icon: "coinbase" }
  | { readonly name: "Trust Wallet"; readonly icon: "trust" };

export function ConnectWalletButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { wallet, isConnecting, connect, disconnect, walletOptions } = useWallet();

  const handleConnect = async (walletOption: WalletOption) => {
    await connect(walletOption);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        className="border-primary/30 hover:border-primary/50 bg-primary/20 hover:bg-primary/30"
        onClick={() => (wallet ? disconnect() : setIsOpen(true))}
        aria-label={wallet ? `Disconnect from ${wallet.option.name}` : "Connect wallet"}
        aria-haspopup="dialog"
      >
        {wallet ? (
          <>
            <span
              className="w-2 h-2 rounded-full bg-green-500 mr-2"
              aria-label="Wallet connection status indicator"
              aria-hidden="true"
            />
            <span>{wallet.option.name.split(" ")[0]}</span>
          </>
        ) : (
          "Connect Wallet"
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="sm:max-w-[400px] border-primary/30 bg-black/90 backdrop-blur-xl"
          aria-labelledby="wallet-dialog-title"
          aria-describedby="wallet-dialog-description"
        >
          <DialogHeader>
            <DialogTitle className="text-center" id="wallet-dialog-title">
              Connect Wallet
            </DialogTitle>
            <DialogDescription className="text-center" id="wallet-dialog-description">
              Select a wallet provider to connect to this application
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4" role="listbox" aria-label="Available wallet providers">
            {walletOptions.map((walletOption) => {
              const WalletIcon = Icons[walletOption.icon];
              return (
                <Button
                  key={walletOption.name}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 border-primary/30 hover:border-primary/50 bg-primary/20 hover:bg-primary/30"
                  onClick={() => handleConnect(walletOption)}
                  disabled={isConnecting}
                  aria-label={`Connect with ${walletOption.name}`}
                  role="option"
                  aria-selected={false}
                >
                  <WalletIcon className="h-8 w-8" aria-hidden="true" />
                  <span className="text-sm">{walletOption.name}</span>
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}