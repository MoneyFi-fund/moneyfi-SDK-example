import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/provider/auth-provider";
import { useMoneyFiProvider } from "./providers/use-moneyfi-provider";
import { validateAuth } from "./utils/validate-auth";
import { transactionQueryKeys } from "./query-keys/transaction-keys";
import { getTokenSymbol, getTokenDecimals } from "@/config/tokens";
import type {
  TransactionHistoryResponse,
  Transaction,
  TransactionAction,
} from "@/types/transaction";

/**
 * Chain ID to network name mapping
 * -1 = Aptos (special case)
 */
const CHAIN_ID_MAP: Record<number, string> = {
  [-1]: "aptos",
  1: "aptos", // Alternative Aptos chain ID
  42161: "arbitrum",
  56: "bsc",
  8453: "base",
  10: "optimism",
  1116: "core",
};

/**
 * Hook for fetching user transaction history from MoneyFi SDK
 * Works for both Aptos and EVM authenticated users
 */
export const useTransactionHistoryQuery = (page = 1, limit = 20) => {
  const { isAuthenticated, user } = useAuth();
  const moneyFi = useMoneyFiProvider();

  return useQuery({
    queryKey: transactionQueryKeys.byPage(user?.address, page),
    queryFn: async (): Promise<TransactionHistoryResponse> => {
      validateAuth(isAuthenticated, user);

      if (!user?.address) {
        throw new Error("Address required");
      }

      try {
        // Call SDK getTransactionHistory with proper object parameter
        const response = await moneyFi.getTransactionHistory({
          address: user.address,
          page,
          limit,
        });

        // Map SDK response to our Transaction type
        return mapSdkResponse(response, page, limit);
      } catch (error) {
        console.error("Error fetching transaction history:", error);
        // Return empty result on error
        return {
          nodes: [],
          totalCount: 0,
          page,
          limit,
        };
      }
    },
    enabled: !!(isAuthenticated && user?.address),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Maps SDK response to our TransactionHistoryResponse type
 */
function mapSdkResponse(
  sdkResponse: unknown,
  page: number,
  limit: number
): TransactionHistoryResponse {
  // Handle array response
  if (Array.isArray(sdkResponse)) {
    return {
      nodes: sdkResponse.map(mapTransaction),
      totalCount: sdkResponse.length,
      page,
      limit,
    };
  }

  // Handle object with nodes/data property
  if (sdkResponse && typeof sdkResponse === "object") {
    const resp = sdkResponse as Record<string, unknown>;
    const nodes = (resp.nodes ?? resp.data ?? resp.transactions) as unknown[];
    if (Array.isArray(nodes)) {
      return {
        nodes: nodes.map(mapTransaction),
        // API returns `total` field, fallback to `totalCount` then nodes.length
        totalCount: (resp.total as number) ?? (resp.totalCount as number) ?? nodes.length,
        page,
        limit,
      };
    }
  }

  // Fallback empty
  return { nodes: [], totalCount: 0, page, limit };
}

/**
 * Maps individual SDK transaction to our Transaction type
 * Based on moneyFi-dapp RecentTransaction.tsx response format
 */
function mapTransaction(tx: unknown): Transaction {
  const t = tx as Record<string, unknown>;

  // Get chain_id/network as number
  const chainId = Number(t.network ?? t.chain_id ?? -1);
  const networkName = CHAIN_ID_MAP[chainId] ?? String(chainId);

  // Get to_network for cross-chain transactions
  const toChainId = t.to_network !== null && t.to_network !== undefined
    ? Number(t.to_network)
    : null;
  const toNetworkName = toChainId !== null
    ? (CHAIN_ID_MAP[toChainId] ?? String(toChainId))
    : null;

  // Get token address and resolve to symbol using token config
  const tokenAddressOrSymbol = String(t.token ?? t.token_symbol ?? "USDC");
  const tokenSymbol = getTokenSymbol(chainId, tokenAddressOrSymbol);

  // Get decimals from API or token config
  const decimals = Number(
    t.token_decimals ?? t.decimals ?? getTokenDecimals(chainId, tokenAddressOrSymbol)
  );
  const rawAmount = Number(t.amount ?? t.value ?? 0);

  return {
    id: String(t.id ?? t.hash ?? t.tx_hash ?? Math.random().toString(36)),
    action: mapAction(String(t.method ?? t.action ?? t.type ?? "unknown")),
    value: rawAmount / Math.pow(10, decimals),
    time: String(t.created_at ?? t.timestamp ?? t.time ?? new Date().toISOString()),
    token: tokenSymbol,
    network: networkName,
    hash: String(t.hash ?? t.tx_hash ?? t.transaction_hash ?? ""),
    fromAddress: t.from ? String(t.from) : undefined,
    toAddress: t.to ? String(t.to) : undefined,
    chainId, // Store original chain_id for explorer URL
    toChainId, // Store target chain_id for cross-chain display
    toNetwork: toNetworkName, // Store target network name
  };
}

/**
 * Maps SDK action string to our TransactionAction type
 */
function mapAction(action: string): TransactionAction {
  const normalized = action.toLowerCase().replace(/-/g, "_");
  const validActions: TransactionAction[] = [
    "deposit",
    "withdraw",
    "rebalance",
    "claim",
    "distribute",
    "transfer_fund",
  ];
  return validActions.includes(normalized as TransactionAction)
    ? (normalized as TransactionAction)
    : "deposit";
}
