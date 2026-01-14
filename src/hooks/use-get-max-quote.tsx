import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/provider/auth-provider";
import { useMoneyFiProvider, validateAuth } from "./common";

export const maxQuoteQueryKeys = {
  all: ["maxQuote"] as const,
  quote: (address?: string) => [...maxQuoteQueryKeys.all, "quote", address] as const,
};

interface MaxQuoteParams {
  address?: string;
}

export const useGetMaxQuoteQuery = (params?: MaxQuoteParams | null) => {
  const { isAuthenticated, user } = useAuth();
  const moneyFi = useMoneyFiProvider();

  // Use provided address or fall back to user's address
  const walletAddress = params?.address || user?.address;

  return useQuery({
    queryKey: maxQuoteQueryKeys.quote(walletAddress),
    queryFn: async () => {
      validateAuth(isAuthenticated, user);

      if (!walletAddress) {
        throw new Error("Wallet address is required");
      }

      try {
        // Pass address as object with 'sender' key to SDK
        const quoteResponse = await moneyFi.getMaxQuotesAmount({ sender: walletAddress });
        return quoteResponse;
      } catch (error) {
        console.error("Error getting max quote:", error);
        throw error;
      }
    },
    enabled: !!(isAuthenticated && user && walletAddress),
    retry: false,
    refetchOnWindowFocus: false,
  });
};