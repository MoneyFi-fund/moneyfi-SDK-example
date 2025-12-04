import { useQuery } from "@tanstack/react-query";
import { useMoneyFiProvider, moneyFiQueryKeys } from "../../common";

interface SupportedTokensOptions {
  chainId?: number;
}

/**
 * Query hook for fetching supported tokens for a chain
 * No authentication required
 */
export const useSupportedTokensQuery = ({ chainId }: SupportedTokensOptions = {}) => {
  const moneyFiAptos = useMoneyFiProvider();

  return useQuery({
    queryKey: moneyFiQueryKeys.supportedTokens(chainId),
    queryFn: async () => {
      const tokens = await moneyFiAptos.getSupportedTokens(
        chainId ? { chain_id: chainId } : undefined
      );
      return tokens;
    },
    enabled: chainId !== undefined,
    staleTime: 60 * 60 * 1000, // 1 hour (tokens rarely change)
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 3,
  });
};