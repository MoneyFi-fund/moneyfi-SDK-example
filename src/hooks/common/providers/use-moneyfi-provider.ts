import { useMemo } from "react";
import { MoneyFi } from "moneyfi-ts-sdk";

/**
 * Provides memoized MoneyFi SDK instance
 * Prevents re-instantiation on every render
 */
export const useMoneyFiProvider = () => {
  const integrationCode = import.meta.env.VITE_INTEGRATION_CODE || "";

  const sdk = useMemo(() => {
    return new MoneyFi(integrationCode);
  }, [integrationCode]);

  return sdk;
};