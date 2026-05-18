import { PublicKey } from '@solana/web3.js';

export function parseWalletAddress(value: string): PublicKey {
  try {
    return new PublicKey(value.trim());
  } catch {
    throw new Error(`Некорректный адрес кошелька: ${value}`);
  }
}
