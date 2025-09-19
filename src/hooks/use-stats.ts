import { useAuth } from "@/provider/auth-provider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { MoneyFiAptos } from "@moneyfi/ts-sdk";
import { MoneyFi } from "@moneyfi/ts-sdk";

export const statsQueryKeys = {
  all: ["stats"] as const,
  user: (address?: string) => [...statsQueryKeys.all, "user", address] as const,
};

export const useGetUserStatisticsQuery = (address?: string) => {
  const { isAuthenticated, user } = useAuth();
  const moneyFiAptos = new MoneyFi(
    [
      {
        chain_id: -1,
        custom_rpc_url: "https://aptos-mainnet.public.blastapi.io"
      }
    ]
  );

  return useQuery({
    queryKey: statsQueryKeys.user(address),
    queryFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error("Please connect your wallet first");
      }

      if (!address) {
        throw new Error("Address is required");
      }

      try {
        const stats = await moneyFiAptos.getUserStatistic({address, chain_id: -1});
        return stats;
      } catch (error) {
        console.error("Error fetching user statistics:", error);
        throw error;
      }
    },
    enabled: !!(isAuthenticated && user && address),
    staleTime: 60_000, // 60 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
