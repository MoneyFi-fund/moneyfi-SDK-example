import { Ed25519PublicKey, type HexInput } from "@aptos-labs/ts-sdk";

export const isEd25519 = (key: HexInput): boolean => {
  try {
    const publicKey = new Ed25519PublicKey(key);
    return publicKey.toUint8Array().length === 32;
  } catch {
    return false;
  }
};
