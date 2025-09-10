export enum NonEvmChain {
    APTOS = "aptos",
  }
  
  export enum AptosProtocols {
    TAPP_EXCHANGE = "tappexchange",
    HYPERION = "hyperion",
    THALA = "thala",
    ARIES = "aries",
  }
  
  export enum NonEvmChainId {
    APTOS = -1,
  }
  
  export type AptosAssetData = [
    Array<string>,
    Array<{
      current_amount: string;
      deposited_amount: string;
    }>,
  ];
  