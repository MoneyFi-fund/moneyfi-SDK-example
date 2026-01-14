import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

interface EVMContextValue {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  connect: (connectorId: string) => void;
  disconnect: () => void;
}

// Default context value for when provider is not available
const defaultContextValue: EVMContextValue = {
  address: undefined,
  isConnected: false,
  isConnecting: false,
  connect: () => {},
  disconnect: () => {},
};

const EVMContext = createContext<EVMContextValue>(defaultContextValue);

export const EVMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnectAsync } = useDisconnect();

  const handleConnect = (connectorId: string) => {
    const selectedConnector = connectors.find(
      (c) => c.id === connectorId
    );
    if (selectedConnector) {
      connect({ connector: selectedConnector });
    }
  };

  const handleDisconnect = () => {
    disconnectAsync();
  };

  const contextValue: EVMContextValue = {
    address,
    isConnected,
    isConnecting,
    connect: handleConnect,
    disconnect: handleDisconnect,
  };

  return <EVMContext.Provider value={contextValue}>{children}</EVMContext.Provider>;
};

export const useEVM = (): EVMContextValue => {
  const context = useContext(EVMContext);
  return context || defaultContextValue;
};
