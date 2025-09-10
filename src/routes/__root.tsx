import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanstackDevtools } from "@tanstack/react-devtools";
import { Web3Provider } from "@/provider/web3-providers";
import { AuthProvider } from "@/provider/auth-provider";
import ChakraUIProvider from "@/provider/chakra-provider";

export const Route = createRootRoute({
  component: () => (
    <>
      <ChakraUIProvider>
        {/* <Web3Provider> */}
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
        {/* </Web3Provider> */}
      </ChakraUIProvider>
    </>
  ),
});
