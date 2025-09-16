import { Outlet, createRootRoute } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Web3Provider } from "@/provider/web3-providers";
import ChakraUIProvider from "@/provider/chakra-provider";
import { AuthProvider } from "@/provider/auth-provider";
import Layout from "@/components/layout/layout";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === "object" && "status" in error) {
          const status = error.status as number;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

export const Route = createRootRoute({
  component: () => (
    <>
      <QueryClientProvider client={queryClient}>
        <ChakraUIProvider>
          <Web3Provider>
            <AuthProvider>
              <Layout>
                <Outlet />
              </Layout>
            </AuthProvider>
          </Web3Provider>
        </ChakraUIProvider>
      </QueryClientProvider>
    </>
  ),
});
