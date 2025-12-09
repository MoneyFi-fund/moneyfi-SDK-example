import { Ed25519PublicKey, type HexInput } from "@aptos-labs/ts-sdk";

export const isEd25519 = (key: HexInput): boolean => {
  try {
    const publicKey = new Ed25519PublicKey(key);
    return publicKey.toUint8Array().length === 32;
  } catch {
    return false;
  }
};

export enum Token {
  USDC = "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b",
  USDT = "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b",
  USD1 = "0x05fabd1b12e39967a3c24e91b7b8f67719a6dacee74f3c8b9fb7d93e855437d2"
}