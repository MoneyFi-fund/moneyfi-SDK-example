import { createContext, useContext, useEffect, useRef } from "react";
import { type PropsWithChildren } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { ToastProvider } from "@/components/toast/ToastProvider";

interface AptosWalletContextValue {
  isInitialized: boolean;
}

const AptosWalletContext = createContext<AptosWalletContextValue | null>(null);

export const AptosWalletProvider = ({ children }: PropsWithChildren) => {
  const walletAdapter = useWallet();
  const initializationRef = useRef(false);

  useEffect(() => {
    if (!initializationRef.current) {
      // Initialize transaction service with wallet adapter
      initializationRef.current = true;
    }
  }, [walletAdapter]);

  // Sync wallet adapter changes with transaction service


  const contextValue: AptosWalletContextValue = {
    isInitialized: initializationRef.current,
  };

  return (
    <AptosWalletContext.Provider value={contextValue}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AptosWalletContext.Provider>
  );
};

export const useAptosWallet = (): AptosWalletContextValue => {
  const context = useContext(AptosWalletContext);
  if (!context) {
    throw new Error("useAptosWallet must be used within an AptosWalletProvider");
  }
  return context;
};