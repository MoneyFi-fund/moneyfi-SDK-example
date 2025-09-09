import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { NETWORK_CONFIG } from "@/config/common";
import { NonEvmChain, NonEvmChainId } from "@/types/non-evm";

export const APTOS_CONFIG = {
  CHAIN_ID: NonEvmChainId.APTOS,
  CHAIN_NAME: NonEvmChain.APTOS,
  CHAIN_LABEL: "Aptos",
  CONTRACT_ADDRESS: "0x97c9ffc7143c5585090f9ade67d19ac95f3b3e7008ed86c73c947637e2862f56",
  USDC: "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b",
  USDT: "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b",
  OPERATOR_ADDRESS: "cecb35833a0182da77df0e5e426e53f5e03767a903a836d15688949f8b7ba624",
};

export const APTOS_CONTRACT_FUNCTION = {
  CHECK_HAS_WALLET_ACCOUNT: `${APTOS_CONFIG.CONTRACT_ADDRESS}::wallet_account::has_wallet_account`,
  DEPOSIT_TO_WALLET_ACCOUNT: `${APTOS_CONFIG.CONTRACT_ADDRESS}::vault::deposit`,
  WITHDRAW_FROM_WALLET_ACCOUNT: `${APTOS_CONFIG.CONTRACT_ADDRESS}::vault::withdraw`,
  GET_ASSETS: `${APTOS_CONFIG.CONTRACT_ADDRESS}::wallet_account::get_assets`,
  GET_WALLET_ACCOUNT_ASSETS: `${APTOS_CONFIG.CONTRACT_ADDRESS}::wallet_account::get_wallet_account_assets`,
};

export const aptosConfig = new AptosConfig({
  network: Network.MAINNET,
  clientConfig: {
    API_KEY: NETWORK_CONFIG.APTOS_API_KEY,
  },
});
export const aptosClient = new Aptos(aptosConfig);
