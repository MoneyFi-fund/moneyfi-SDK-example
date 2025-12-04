import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/provider/auth-provider";
import { useMoneyFiProvider, validateAuth } from "./common";

export const maxQuoteQueryKeys = {
  all: ["maxQuote"] as const,
  quote: (params?: any) => [...maxQuoteQueryKeys.all, "quote", params] as const,
};

export const useGetMaxQuoteQuery = (params: any) => {
  const { isAuthenticated, user } = useAuth();
  const moneyFiAptos = useMoneyFiProvider();

  return useQuery({
    queryKey: maxQuoteQueryKeys.quote(params),
    queryFn: async () => {
      validateAuth(isAuthenticated, user);

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