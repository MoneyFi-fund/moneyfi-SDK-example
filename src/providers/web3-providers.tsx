import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { type PropsWithChildren } from "react";
import { Network } from "@aptos-labs/ts-sdk";
import { AuthProvider } from "@/providers/auth-provider";
import { AptosWalletProvider } from "@/providers/aptos-wallet-provider";
import ChakraUIProvider from "@/providers/chakra-provider";

export const Web3Provider = ({ children }: PropsWithChildren) => {
  return (
    <ChakraUIProvider>
      <AptosWalletAdapterProvider
        autoConnect={true}
        dappConfig={{
          network: Network.MAINNET,
          aptosApiKeys: {
            mainnet: import.meta.env.VITE_APTOS_CLIENT_API_KEY,
          },
        }}
        onError={(error) => {
          console.log("error", error);
        }}
      >
        <AuthProvider>
          <AptosWalletProvider>
            {children}
          </AptosWalletProvider>
        </AuthProvider>
      </AptosWalletAdapterProvider>
    </ChakraUIProvider>
  );
};
