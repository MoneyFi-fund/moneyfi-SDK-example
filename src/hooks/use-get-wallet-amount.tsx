import { useQuery } from "@tanstack/react-query";
import { MoneyFi } from "@moneyfi/ts-sdk";
// import { MoneyFi } from "@moneyfi/ts-sdk";
import { useAuth } from "@/provider/auth-provider";

export const walletAmountQueryKeys = {
  all: ["walletAmount"] as const,
  assets: (sender?: string) => [...walletAmountQueryKeys.all, "assets", sender] as const,
};

export const useGetWalletAmountQuery = (sender: string | null) => {
  const { isAuthenticated, user } = useAuth();
  const moneyFiAptos = new MoneyFi(import.meta.env.VITE_INTEGRATION_CODE || "");

  return useQuery({
    queryKey: walletAmountQueryKeys.assets(sender || undefined),
    queryFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error("Please connect your wallet first");
      }

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