import { useQuery } from "@tanstack/react-query";
import { useMoneyFiProvider, moneyFiQueryKeys } from "../../common";

/**
 * Query hook for fetching supported chains from MoneyFi
 * No authentication required
 */
export const useSupportedChainsQuery = () => {
  const moneyFiAptos = useMoneyFiProvider();

  return useQuery({
    queryKey: moneyFiQueryKeys.supportedChains(),
    queryFn: async () => {
      const chains = await moneyFiAptos.getSupportedChains();
      return chains;
    },
    staleTime: 60 * 60 * 1000, // 1 hour (chains rarely change)
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 3,
  });
};