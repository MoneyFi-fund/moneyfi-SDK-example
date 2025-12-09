export interface ChainBalance {
  chain: string;
  balance: number;
}

export interface ProtocolBalance {
  protocol: string;
  balance: number;
}

export interface TokenBalance {
  token: string;
  chain: string;
  balance: number;
}

export interface AssetAllocationResponse {
  balance_by_chain: ChainBalance[];
  balance_by_protocol: ProtocolBalance[];
  balance_by_token: TokenBalance[];
}

export interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}
