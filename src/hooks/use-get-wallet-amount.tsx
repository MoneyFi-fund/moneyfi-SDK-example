import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/provider/auth-provider";
import { useMoneyFiProvider, validateAuth } from "./common";

export const walletAmountQueryKeys = {
  all: ["walletAmount"] as const,
  assets: (sender?: string) => [...walletAmountQueryKeys.all, "assets", sender] as const,
};

export const useGetWalletAmountQuery = (sender: string | null) => {
  const { isAuthenticated, user } = useAuth();
  const moneyFiAptos = useMoneyFiProvider();

  return useQuery({
    queryKey: walletAmountQueryKeys.assets(sender || undefined),
    queryFn: async () => {
      validateAuth(isAuthenticated, user);

      if (!sender) {
        throw new Error("Sender address is required");
      }

      try {
        const assetsResponse = await moneyFiAptos.getWalletAccountAssets({
          sender,
        });
        return assetsResponse;
      } catch (error) {
        console.error("Error getting wallet account assets:", error);
        throw error;
      }
    },
    enabled: !!(isAuthenticated && user && sender),
    retry: false,
    refetchOnWindowFocus: false,
  });
};