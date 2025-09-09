import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanstackDevtools } from "@tanstack/react-devtools";
import { Web3Provider } from "@/providers/web3-providers";
import { AptosWalletProvider } from "@/providers/aptos-wallet-provider";
import ChakraUIProvider from "@/providers/chakra-provider";
import { AuthProvider } from "@/providers/auth-provider";

export const Route = createRootRoute({
  component: () => (
    <>
      <ChakraUIProvider>
        <Web3Provider>
            <AptosWalletProvider>
          <AuthProvider>
              <Outlet />
              <TanstackDevtools
                config={{
                  position: "bottom-left",
                }}
                plugins={[
                  {
                    name: "Tanstack Router",
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                ]}
              />
          </AuthProvider>
            </AptosWalletProvider>
        </Web3Provider>
      </ChakraUIProvider>
    </>
  ),
});
