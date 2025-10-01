export interface NetworkIconMapping {
  name: string;
  iconPath: string;
  type: 'evm' | 'aptos';
}

export interface TokenIconMapping {
  symbol: string;
  iconPath: string;
}

export const NETWORK_ICON_MAPPINGS: NetworkIconMapping[] = [
  // API response format mappings
  { name: 'Base', iconPath: '/network/evm/base.svg', type: 'evm' },
  { name: 'Arbitrum', iconPath: '/network/evm/arbitrum.svg', type: 'evm' },
  { name: 'BinanceSmartChain', iconPath: '/network/evm/bsc.svg', type: 'evm' },
  { name: 'Mainnet', iconPath: '/network/evm/eth.svg', type: 'evm' },
  { name: 'Soneium', iconPath: '/network/evm/soneium.svg', type: 'evm' },
  { name: 'Core', iconPath: '/network/evm/core.svg', type: 'evm' },
  { name: 'Aptos', iconPath: '/network/aptos/aptos-square.svg', type: 'aptos' },

  // Alternative name mappings
  { name: 'ethereum', iconPath: '/network/evm/eth.svg', type: 'evm' },
  { name: 'eth', iconPath: '/network/evm/eth.svg', type: 'evm' },
  { name: 'polygon', iconPath: '/network/evm/polygon.svg', type: 'evm' },
  { name: 'matic', iconPath: '/network/evm/polygon.svg', type: 'evm' },
  { name: 'arbitrum', iconPath: '/network/evm/arbitrum.svg', type: 'evm' },
  { name: 'arb', iconPath: '/network/evm/arbitrum.svg', type: 'evm' },
  { name: 'bsc', iconPath: '/network/evm/bsc.svg', type: 'evm' },
  { name: 'binance', iconPath: '/network/evm/bsc.svg', type: 'evm' },
  { name: 'base', iconPath: '/network/evm/base.svg', type: 'evm' },
  { name: 'optimism', iconPath: '/network/evm/op.svg', type: 'evm' },
  { name: 'op', iconPath: '/network/evm/op.svg', type: 'evm' },
  { name: 'core', iconPath: '/network/evm/core.svg', type: 'evm' },
  { name: 'soneium', iconPath: '/network/evm/soneium.svg', type: 'evm' },
  { name: 'aptos', iconPath: '/network/aptos/aptos-square.svg', type: 'aptos' },
];

export const TOKEN_ICON_MAPPINGS: TokenIconMapping[] = [
  { symbol: 'USDT', iconPath: '/common/usdt.svg' },
  { symbol: 'usdt', iconPath: '/common/usdt.svg' },
  { symbol: 'USDC', iconPath: '/common/usdc.svg' },
  { symbol: 'usdc', iconPath: '/common/usdc.svg' },
];

export const getNetworkIcon = (networkName: string): string | null => {
  const mapping = NETWORK_ICON_MAPPINGS.find(
    (item) => item.name.toLowerCase() === networkName?.toLowerCase()
  );
  return mapping ? mapping.iconPath : null;
};

export const getTokenIcon = (tokenSymbol: string): string | null => {
  const mapping = TOKEN_ICON_MAPPINGS.find(
    (item) => item.symbol.toLowerCase() === tokenSymbol?.toLowerCase()
  );
  return mapping ? mapping.iconPath : null;
};

export const getNetworkType = (networkName: string): 'evm' | 'aptos' | null => {
  const mapping = NETWORK_ICON_MAPPINGS.find(
    (item) => item.name.toLowerCase() === networkName?.toLowerCase()
  );
  return mapping ? mapping.type : null;
};