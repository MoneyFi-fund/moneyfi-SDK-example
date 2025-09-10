export const APTOS_WALLET = {
    OKX: {
      name: "OKX Wallet",
      deepLink: "okx://wallet/dapp/url?dappUrl=",
      url: "https://web3.okx.com/download?deeplink=",
    },
    PETRA: {
      name: "Petra",
      deepLink: null,
      url: "https://petra.app/explore?link=",
    },
    NIGHTLY: {
      name: "Nightly",
      deepLink: null,
      url: "nightly://v1?network=aptos&url=",
    },
    PONTEM: {
      name: "Pontem",
      deepLink: null,
      url: "pontem-wallet://link?url=",
    },
  } as const;
  