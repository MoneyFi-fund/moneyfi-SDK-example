/**
 * Validates user authentication for mutations/queries
 * Throws standardized error if not authenticated
 */
export const validateAuth = (
  isAuthenticated: boolean,
  user: any | null | undefined
): void => {
  if (!isAuthenticated || !user) {
    throw new Error("Please connect your wallet first");
  }
};

/**
 * Validates required address parameter
 */
export const validateAddress = (address?: string): string => {
  if (!address) {
    throw new Error("Address is required");
  }
  return address;
};