import { type ReactNode } from "react";
import { AptosWalletAdapterProvider, type DappConfig } from "@aptos-labs/wallet-adapter-react";
import { Network as AptosNetwork } from "@aptos-labs/ts-sdk";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, arbitrum, base, bsc } from "wagmi/chains";
import { metaMask, injected } from "@wagmi/connectors";
import { EVMProvider } from "./evm-provider";

const wagmiConfig = createConfig({
  chains: [mainnet, arbitrum, base, bsc],
  connectors: [metaMask(), injected()],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
  },
});

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
          {children}
        </AptosWalletAdapterProvider>
      </EVMProvider>
    </WagmiProvider>
  );
};
