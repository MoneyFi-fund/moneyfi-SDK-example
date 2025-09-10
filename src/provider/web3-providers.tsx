import { type ReactNode } from "react";
import { AptosWalletAdapterProvider, type DappConfig } from "@aptos-labs/wallet-adapter-react";
import { Network as AptosNetwork } from "@aptos-labs/ts-sdk";

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const dappConfig: DappConfig = {
    network: AptosNetwork.MAINNET,
    aptosApiKeys: import.meta.env.VITE_APTOS_CLIENT_API_KEY,
  };
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={dappConfig}
      onError={(error) => {
        console.log("error", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};
