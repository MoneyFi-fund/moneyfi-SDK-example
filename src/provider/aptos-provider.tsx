import React, { createContext, useContext, type ReactNode } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

interface AptosContextValue {
  address: string | undefined;
  publicKey: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  walletName: string | undefined;
  connect: (walletName: string) => Promise<void>;
  disconnect: () => Promise<void>;
}

// Default context value for when provider is not available
const defaultContextValue: AptosContextValue = {
  address: undefined,
  publicKey: undefined,
  isConnected: false,
  isConnecting: false,
  walletName: undefined,
  connect: async () => {},
  disconnect: async () => {},
};

const AptosContext = createContext<AptosContextValue>(defaultContextValue);

export const AptosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    account,
    connected,
    connect,
    disconnect,
    wallet,
    isLoading: isConnecting
  } = useWallet();

  const handleConnect = async (walletName: string) => {
    await connect(walletName);
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  const contextValue: AptosContextValue = {
    address: account?.address?.toString(),
    publicKey: account?.publicKey?.toString(),
    isConnected: connected,
    isConnecting,
    walletName: wallet?.name,
    connect: handleConnect,
    disconnect: handleDisconnect,
  };

  return <AptosContext.Provider value={contextValue}>{children}</AptosContext.Provider>;
};

export const useAptos = (): AptosContextValue => {
  const context = useContext(AptosContext);
  return context || defaultContextValue;
};
