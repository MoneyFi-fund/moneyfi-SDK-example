import { Ed25519PublicKey, KeylessPublicKey, KeylessSignature } from '@aptos-labs/ts-sdk';

/**
 * Generates a random nonce for message signing
 */
export function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Creates a message for wallet signing
 */
export function createSignMessage(nonce: string, additionalText?: string): string {
  const baseMessage = `Sign this message to authenticate with MoneyFi`;
  const nonceMessage = `Nonce: ${nonce}`;
  const timestamp = `Timestamp: ${new Date().toISOString()}`;
  
  return [baseMessage, additionalText, nonceMessage, timestamp].filter(Boolean).join('\n');
}

/**
 * Checks if a public key is Ed25519 (standard wallet) vs Keyless (Google OAuth)
 */
export function isEd25519PublicKey(publicKey: string): boolean {
  try {
    // Try to parse as Ed25519 first
    new Ed25519PublicKey(publicKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Formats address to ensure it starts with 0x
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return address.startsWith('0x') ? address : `0x${address}`;
}

/**
 * Truncates an address for display purposes
 */
export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  const formatted = formatAddress(address);
  return `${formatted.slice(0, startChars)}...${formatted.slice(-endChars)}`;
}

/**
 * Validates if a string is a valid Aptos address
 */
export function isValidAptosAddress(address: string): boolean {
  if (!address) return false;
  const cleanAddress = address.replace('0x', '');
  return /^[a-fA-F0-9]{1,64}$/.test(cleanAddress);
}

/**
 * Creates authentication payload for different signature types
 */
export function createAuthPayload(params: {
  message: string;
  signature: any;
  publicKey: any;
  address: string;
  walletName?: string;
}) {
  const { message, signature, publicKey, address, walletName } = params;

  // Check if this is a keyless signature (Google OAuth)
  const isKeyless = !isEd25519PublicKey(publicKey.toString());

  if (isKeyless) {
    // Handle keyless signatures
    const keylessPublicKey = new KeylessPublicKey(
      publicKey.iss,
      publicKey.idCommitment
    );
    
    const keylessSignature = new KeylessSignature(signature);

    return {
      encoded_signature: keylessSignature.toString(),
      encoded_pubkey: keylessPublicKey.toString(),
      message,
      address: formatAddress(address),
      wallet_name: walletName,
      signature_type: 'keyless' as const,
    };
  } else {
    // Handle Ed25519 signatures (standard wallets)
    return {
      encoded_signature: signature.toString(),
      encoded_pubkey: publicKey.toString(),
      message,
      address: formatAddress(address),
      wallet_name: walletName,
      signature_type: 'ed25519' as const,
    };
  }
}

/**
 * Validates session expiration with buffer time
 */
export function isSessionExpiring(expiresAt: Date, bufferMinutes = 5): boolean {
  const bufferTime = bufferMinutes * 60 * 1000;
  return new Date().getTime() > (expiresAt.getTime() - bufferTime);
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}