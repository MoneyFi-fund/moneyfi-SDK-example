/**
 * Query key factory for statistics/analytics queries
 */
export const statsQueryKeys = {
  all: ["stats"] as const,
  user: (address?: string) =>
    [...statsQueryKeys.all, "user", address] as const,
} as const;