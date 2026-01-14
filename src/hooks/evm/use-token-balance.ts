import { useReadContract } from "wagmi";
import { erc20Abi } from "viem";
import { useMemo } from "react";

interface UseTokenBalanceParams {
  tokenAddress: string | undefined;
  userAddress: string | undefined;
  chainId: number | undefined;
  enabled?: boolean;
}

interface TokenBalanceResult {
  rawBalance: bigint;
  displayBalance: string;
  decimals: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * Hook for fetching ERC20 token balance using wagmi v2.
 * Uses useReadContract instead of useBalance (token param removed in v2).
 */
export const useTokenBalance = ({
  tokenAddress,
  userAddress,
  chainId,
  enabled = true,
}: UseTokenBalanceParams): TokenBalanceResult => {
  // Fetch balance using ERC20 balanceOf
  const {
    data: balance,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
    refetch,
  } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    chainId,
    query: {
      enabled: !!(enabled && tokenAddress && userAddress && chainId),
    },
  });

  // USDC/USDT typically use 6 decimals
  const decimals = 6;

  const displayBalance = useMemo(() => {
    if (!balance) return "0.00";
    return (Number(balance) / 10 ** decimals).toFixed(2);
  }, [balance]);

  return {
    rawBalance: balance ?? BigInt(0),
    displayBalance,
    decimals,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
    refetch,
  };
};

/**
 * Validates if the entered amount exceeds the available balance.
 */
export const validateBalance = (
  amount: string,
  rawBalance: bigint,
  decimals: number = 6
): { isInsufficientBalance: boolean; maxAmount: number } => {
  const numAmount = Number(amount) || 0;
  const maxAmount = Number(rawBalance) / 10 ** decimals;
  const isInsufficientBalance = numAmount > maxAmount;

  return { isInsufficientBalance, maxAmount };
};
