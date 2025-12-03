import { createConfig, http } from "wagmi";
import { mainnet, arbitrum, base, bsc } from "wagmi/chains";
import { metaMask, injected } from "@wagmi/connectors";

/**
 * Wagmi configuration for EVM chain interactions
 * Supports: Ethereum Mainnet, Arbitrum, Base, Binance Smart Chain
 */
export const wagmiConfig = createConfig({
  chains: [mainnet, arbitrum, base, bsc],
  connectors: [metaMask(), injected()],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
  },
});

/**
 * Chain ID to chain name mapping for reference
 */
export const WAGMI_CHAIN_MAP: Record<number, string> = {
  1: "mainnet",
  42161: "arbitrum",
  8453: "base",
  56: "bsc",
} as const;

export type WagmiChainId = keyof typeof WAGMI_CHAIN_MAP;
