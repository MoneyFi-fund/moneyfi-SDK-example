/**
 * Shorten wallet address for display
 * @example "0x1234567890abcdef1234567890abcdef" -> "0x1234...cdef"
 */
export const shortenAddress = (address: string, chars = 4): string => {
  if (!address) return "";
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

/**
 * Format transaction value with proper decimals
 */
export const formatValue = (value: number): string => {
  if (!value) return "0.00";
  if (Math.abs(value) < 0.01 && value !== 0) {
    return value.toExponential(2);
  }
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Get action badge color based on transaction type
 */
export const getActionColor = (action: string): string => {
  const colors: Record<string, string> = {
    deposit: "green",
    withdraw: "red",
    rebalance: "blue",
    claim: "purple",
    distribute: "orange",
    transfer_fund: "teal",
  };
  return colors[action.toLowerCase()] || "gray";
};

/**
 * Format date for display with relative time for recent transactions
 */
export const formatTransactionDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Show relative time for recent transactions
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  // Show full date for older transactions
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

/**
 * Get action icon character
 */
export const getActionIcon = (action: string): string => {
  const icons: Record<string, string> = {
    deposit: "↓",
    withdraw: "↑",
    rebalance: "↔",
    claim: "✓",
    distribute: "→",
    transfer_fund: "⇄",
  };
  return icons[action.toLowerCase()] || "•";
};

/**
 * Format token symbol for display
 * If token is an address (not resolved), shorten it to first 6 + last 6 chars
 */
export const formatTokenSymbol = (token: string): string => {
  if (!token) return "USDC";

  // If it looks like an address (0x... and long), shorten it
  if (token.startsWith("0x") && token.length > 20) {
    return `${token.slice(0, 6)}...${token.slice(-6)}`;
  }

  return token;
};
