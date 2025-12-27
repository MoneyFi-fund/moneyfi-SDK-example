export type TransactionAction =
  | "deposit"
  | "withdraw"
  | "rebalance"
  | "claim"
  | "distribute"
  | "transfer_fund";

export interface Transaction {
  id: string;
  action: TransactionAction;
  value: number;
  time: string;
  token: string;
  network: string;
  hash: string;
  fromAddress?: string;
  toAddress?: string;
  /** Original chain ID from API (-1 for Aptos, 8453 for Base, etc.) */
  chainId?: number;
  /** Target network for cross-chain transactions (e.g., -1 for Aptos, 8453 for Base) */
  toChainId?: number | null;
  /** Target network name for cross-chain transactions */
  toNetwork?: string | null;
}

export interface TransactionHistoryResponse {
  nodes: Transaction[];
  totalCount: number;
  page: number;
  limit: number;
}
