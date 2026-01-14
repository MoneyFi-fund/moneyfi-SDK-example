export const BALANCE_REFETCH_CONFIG = {
  immediate: 0, // Immediate optimistic refetch
  delayed: 4000, // 4 seconds delayed refetch for blockchain confirmation
  staleTime: 30_000, // 30 seconds
  gcTime: 5 * 60 * 1000, // 5 minutes
} as const;