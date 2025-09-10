import { type ReactNode } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network as AptosNetwork } from "@aptos-labs/ts-sdk";

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{
        network: AptosNetwork.MAINNET,
        aptosApiKeys: import.meta.env.VITE_APTOS_CLIENT_API_KEY,
      }}
      onError={(error) => {
        console.log("error", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};
