import { useAuth } from "@/provider/auth-provider";
import { useMoneyFiProvider } from "./providers/use-moneyfi-provider";
import { moneyFiQueryKeys } from "./query-keys/moneyfi-query-keys";
import { useQuery } from "@tanstack/react-query";

export const useGetUserAssetAllocation = (address: string) => {
    const { isAuthenticated, user } = useAuth();
    const moneyFi = useMoneyFiProvider();
    return useQuery({
        queryKey: moneyFiQueryKeys.userAssetAllocation(address),
        queryFn: async () => {
            if (!isAuthenticated || !user) {
                throw new Error("User is not authenticated");
            }
            try {
                const allocation = await moneyFi.getUserAssetAllocationResponse(address);
                return allocation;
            } catch (error) {
                console.error("Error fetching user asset allocation:", error);
                throw error;
            }
        },
        enabled: !!(isAuthenticated && user && address),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    })
}