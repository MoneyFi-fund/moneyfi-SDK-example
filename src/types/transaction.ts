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
  /** Strategy name for distribute/transfer_fund actions */
  strategyName?: string;
  /** Protocol name for distribute/transfer_fund actions */
  protocolName?: string;
  /** Address type for 'to' address (e.g., "MoneyFi", "Wallet") */
  toAddressType?: string;
  /** Address type for 'from' address */
  fromAddressType?: string;
  /** Receiver address for transfer transactions */
  receiver?: string;
}

export interface TransactionHistoryResponse {
  nodes: Transaction[];
  totalCount: number;
  page: number;
  limit: number;
}
