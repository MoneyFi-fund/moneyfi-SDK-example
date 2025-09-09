export enum Platform {
  APTOS = "aptos",
}

export interface WalletInfo {
  name: string;
  icon: string;
  url: string;
  deepLink?: string;
}