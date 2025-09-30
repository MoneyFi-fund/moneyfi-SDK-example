import { useQuery } from "@tanstack/react-query";
import { MoneyFi } from "quy-ts-sdk";
// import { MoneyFi } from "@moneyfi/ts-sdk";
import { useAuth } from "@/provider/auth-provider";

export const checkWalletAccountQueryKeys = {
  all: ["checkWalletAccount"] as const,
  account: (address?: string) =>
    [...checkWalletAccountQueryKeys.all, "account", address] as const,
};

export const useCheckWalletAccountQuery = () => {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: checkWalletAccountQueryKeys.account(user?.address),
    queryFn: async () => {
      if (!user?.address) {
        return false;
      }

      try {
        const moneyFiAptos = new MoneyFi(import.meta.env.VITE_INTEGRATION_CODE || "");
        const hasAccount = await moneyFiAptos.hasWalletAccount({
          sender: user.address.startsWith('0x') ? user.address : `0x${user.address}`
        });
        return hasAccount;
      } catch (error) {
        console.error("Error checking wallet account:", error);
        return false;
      }
    },
    enabled: isAuthenticated && !!user?.address,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
};
