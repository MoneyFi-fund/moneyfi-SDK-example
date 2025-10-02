import { useQuery } from "@tanstack/react-query";
import { MoneyFi } from "quy-ts-sdk";
// import { MoneyFi } from "@moneyfi/ts-sdk";
import { useAuth } from "@/provider/auth-provider";

export const maxQuoteQueryKeys = {
  all: ["maxQuote"] as const,
  quote: (params?: any) => [...maxQuoteQueryKeys.all, "quote", params] as const,
};

export const useGetMaxQuoteQuery = (params: any) => {
  const { isAuthenticated, user } = useAuth();
  const moneyFiAptos = new MoneyFi(import.meta.env.VITE_INTEGRATION_CODE || "");

  return useQuery({
    queryKey: maxQuoteQueryKeys.quote(params),
    queryFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error("Please connect your wallet first");
      }

      if (!params) {
        throw new Error("Quote parameters are required");
      }

      try {
        const quoteResponse = await moneyFiAptos.getMaxQuotesAmount(params);
        return quoteResponse;
      } catch (error) {
        console.error("Error getting max quote:", error);
        throw error;
      }
    },
    enabled: !!(isAuthenticated && user && params),
    retry: false,
    refetchOnWindowFocus: false,
  });
};