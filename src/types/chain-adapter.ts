/**
 * Unified Chain Adapter Interface
 * Provides a common interface for interacting with different blockchain chains
 * Follows clean architecture principles with separation of concerns
 */

export interface ChainConfig {
  /** Unique chain identifier */
  id: string | number;
  /** Display name for the chain */
  name: string;
  /** Chain type */
  type: 'evm' | 'aptos';
  /** Chain ID for EVM chains */
  chainId?: number;
  /** RPC endpoints for the chain */
  rpcUrl?: string;
  /** Block explorer configuration */
  explorer?: {
    name: string;
    url: string;
  };
  /** Native token information */
  nativeToken: {
    symbol: string;
    decimals: number;
    address?: string;
  };
}

export interface TokenInfo {
  /** Token contract address */
  address: string;
  /** Token symbol */
  symbol: string;
  /** Token name */
  name: string;
  /** Token decimals */
  decimals: number;
  /** Chain the token belongs to */
  chain: string;
  /** Token logo URL */
  logo?: string;
}

export interface TransactionRequest {
  /** Recipient address */
  to: string;
  /** Amount to transfer (in smallest unit) */
  amount: string | bigint;
  /** Token address (empty for native token) */
  tokenAddress?: string;
  /** Optional transaction data */
  data?: string;
}

export interface TransactionResult {
  /** Transaction hash */
  hash: string;
  /** Block number */
  blockNumber?: number;
  /** Transaction status */
  status: 'pending' | 'confirmed' | 'failed';
  /** Gas used */
  gasUsed?: string;
  /** Effective gas price */
  effectiveGasPrice?: string;
}

export interface BalanceInfo {
  /** Token address */
  tokenAddress: string;
  /** Token balance (in smallest unit) */
  balance: string;
  /** Formatted balance */
  formattedBalance: string;
  /** Token decimals */
  decimals: number;
  /** Token symbol */
  symbol: string;
}

export interface WalletInfo {
  /** Wallet address */
  address: string;
  /** Chain the wallet is connected to */
  chainId?: string | number;
  /** Connection status */
  isConnected: boolean;
}

export interface ChainValidationError extends Error {
  /** Validation error code */
  code: string;
  /** Field that failed validation */
  field?: string;
  /** Expected value */
  expected?: any;
  /** Actual value received */
  actual?: any;
}

/**
 * Base interface for all chain adapters
 * Defines the contract that all chain-specific adapters must follow
 */
export interface ChainAdapter {
  /** Get chain configuration */
  getChainConfig(): ChainConfig;

  /** Get wallet connection information */
  getWalletInfo(): WalletInfo | null;

  /** Get all supported tokens for this chain */
  getSupportedTokens(): Promise<TokenInfo[]>;

  /** Get balance for a specific token */
  getBalance(tokenAddress: string, address: string): Promise<BalanceInfo>;

  /** Validate transaction parameters */
  validateTransaction(request: TransactionRequest): Promise<void>;

  /** Send a transaction */
  sendTransaction(request: TransactionRequest): Promise<TransactionResult>;

  /** Get transaction status */
  getTransactionStatus(hash: string): Promise<TransactionResult>;

  /** Wait for transaction confirmation */
  waitForTransaction(hash: string, confirmations?: number): Promise<TransactionResult>;

  /** Estimate gas for transaction (EVM only) */
  estimateGas?(request: TransactionRequest): Promise<string>;

  /** Get transaction receipt (EVM only) */
  getTransactionReceipt?(hash: string): Promise<any>;

  /** Clean up resources */
  cleanup(): void;
}

/**
 * Factory function type for creating chain adapters
 */
export type ChainAdapterFactory<T extends ChainAdapter = ChainAdapter> = (
  config: ChainConfig
) => T;

/**
 * Supported chain types
 */
export type SupportedChainType = 'evm' | 'aptos';

/**
 * Chain adapter registry interface
 */
export interface ChainAdapterRegistry {
  /** Register a chain adapter */
  register(chainType: SupportedChainType, adapter: ChainAdapter): void;

  /** Get adapter for a chain type */
  getAdapter(chainType: SupportedChainType): ChainAdapter | null;

  /** Get all registered adapters */
  getAllAdapters(): Map<SupportedChainType, ChainAdapter>;

  /** Unregister an adapter */
  unregister(chainType: SupportedChainType): void;
}

/**
 * Transaction manager interface
 * Handles transaction lifecycle and status tracking
 */
export interface TransactionManager {
  /** Submit a new transaction */
  submitTransaction(
    chainType: SupportedChainType,
    request: TransactionRequest,
    options?: TransactionOptions
  ): Promise<TransactionResult>;

  /** Track transaction status */
  trackTransaction(hash: string): Promise<TransactionResult>;

  /** Cancel pending transaction */
  cancelTransaction(hash: string): Promise<boolean>;

  /** Get transaction history */
  getTransactionHistory(address: string, limit?: number): Promise<TransactionResult[]>;
}

/**
 * Options for transaction submission
 */
export interface TransactionOptions {
  /** Gas limit (EVM only) */
  gasLimit?: string;
  /** Gas price (EVM only) */
  gasPrice?: string;
  /** Max fee per gas (EIP-1559) */
  maxFeePerGas?: string;
  /** Max priority fee per gas (EIP-1559) */
  maxPriorityFeePerGas?: string;
  /** Transaction timeout in milliseconds */
  timeout?: number;
  /** Number of confirmations to wait for */
  confirmations?: number;
  /** Skip validation (for advanced use cases) */
  skipValidation?: boolean;
}