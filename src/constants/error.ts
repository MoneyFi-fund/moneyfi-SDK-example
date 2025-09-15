export const ERROR_CODE = {
  APPROVE_REJECTED: "You didn't approve the fund request. Please try again if you want to proceed with the deposit.",
  DEPOSIT_REJECTED:
    "You didn't approve the deposit transaction. No funds have been transferred. Click the Deposit button again to restart the process.",
  FAILED: "Something went wrong. Please try again.",
  REFERRAL_CODE_ALREADY_EXISTS: "\"ref_code already used\"",
};

export const EVM_ERROR_CODE = {
  APPROVE_FAILED: "(EVM_001): Approve failed.",
  DEPOSIT_FAILED: "(EVM_003): Deposit failed.",
};

export const APTOS_ERROR_CODE = {
  CREATE_ACCOUNT_FAILED: "(APTOS_001): Create account failed.",
  DEPOSIT_TO_WALLET_ACCOUNT_FAILED: "(APTOS_002): Deposit failed.",
  SWAP_FAILED: "(APTOS_003): Swap failed.",
  REQUEST_WITHDRAW_FAILED: "(APTOS_004): Request withdraw failed.",
  CHECK_ASSETS_FAILED: "(APTOS_005): Swap failed.",
};
