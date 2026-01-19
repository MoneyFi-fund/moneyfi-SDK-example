import { type ReactNode } from "react";
import { AptosWalletAdapterProvider, type DappConfig } from "@aptos-labs/wallet-adapter-react";
import { Network as AptosNetwork } from "@aptos-labs/ts-sdk";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/config/wagmi-config";
import { EVMProvider } from "./evm-provider";
import { AptosProvider } from "./aptos-provider";

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const dappConfig: DappConfig = {
    network: AptosNetwork.MAINNET,
    aptosApiKeys: import.meta.env.VITE_APTOS_CLIENT_API_KEY,
  };
  return (
    <WagmiProvider config={wagmiConfig}>
      <EVMProvider>
        <AptosWalletAdapterProvider
          autoConnect={true}
          dappConfig={dappConfig}
          onError={(error) => {
            console.log("error", error);
          }}
        >
          <AptosProvider>
            {children}
          </AptosProvider>
        </AptosWalletAdapterProvider>
      </EVMProvider>
    </WagmiProvider>
  );
};
