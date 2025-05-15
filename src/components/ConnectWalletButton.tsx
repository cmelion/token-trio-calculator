// src/components/ConnectWalletButton.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Icons } from "@/components/icons";
import { useWallet } from "@/components/providers/wallet";

export function ConnectWalletButton() {
    const [isOpen, setIsOpen] = useState(false);
    const { wallet, isConnecting, connect, disconnect, walletOptions } = useWallet();

    const handleConnect = async (walletOption) => {
        await connect(walletOption);
        setIsOpen(false);
    };

    return (
        <>
            <Button
                variant="outline"
                className="border-primary/30 hover:border-primary/50 bg-primary/20 hover:bg-primary/30"
                onClick={() => wallet ? disconnect() : setIsOpen(true)}
            >
                {wallet ? (
                    <>
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                        {wallet.option.name.split(" ")[0]}
                    </>
                ) : (
                    "Connect Wallet"
                )}
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[400px] border-primary/30 bg-black/90 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="text-center">Connect Wallet</DialogTitle>
                        <DialogDescription className="text-center">
                            Select a wallet provider to connect to this application
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        {walletOptions.map((walletOption) => {
                            const WalletIcon = Icons[walletOption.icon];
                            return (
                                <Button
                                    key={walletOption.name}
                                    variant="outline"
                                    className="h-24 flex flex-col items-center justify-center gap-2 border-primary/30 hover:border-primary/50 bg-primary/20 hover:bg-primary/30"
                                    onClick={() => handleConnect(walletOption)}
                                    disabled={isConnecting}
                                >
                                    <WalletIcon className="h-8 w-8" />
                                    <span className="text-sm">{walletOption.name}</span>
                                </Button>
                            )
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}