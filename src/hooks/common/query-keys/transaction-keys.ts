export const transactionQueryKeys = {
  all: ["transactions"] as const,
  history: (address?: string) =>
    [...transactionQueryKeys.all, "history", address] as const,
  byPage: (address?: string, page?: number) =>
    [...transactionQueryKeys.history(address), "page", page] as const,
};
