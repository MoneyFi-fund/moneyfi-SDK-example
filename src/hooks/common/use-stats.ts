import { useAuth } from "@/provider/auth-provider";
import { useQuery } from "@tanstack/react-query";
import { useMoneyFiProvider, validateAuth } from ".";
import { statsQueryKeys } from "./query-keys/stats-query-keys";

export const useGetUserStatisticsQuery = (address?: string) => {
  const { isAuthenticated, user } = useAuth();
  const moneyFiAptos = useMoneyFiProvider();

  return useQuery({
    queryKey: statsQueryKeys.user(address),
    queryFn: async () => {
      validateAuth(isAuthenticated, user);

      if (!address) {
        throw new Error("Address is required");
      }

      try {
        const stats = await moneyFiAptos.getUserStatistic({address});
        return stats;
      } catch (error) {
        console.error("Error fetching user statistics:", error);
        throw error;
      }
    },
    enabled: !!(isAuthenticated && user && address),
    staleTime: 60_000, // 60 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 10,
  });
};
