import type { ParsedTransactionWithMeta, PublicKey } from '@solana/web3.js';
import type { Challenge, ChallengeTask } from '../challenge/types.js';
import type { MultiRpcClient } from './multi-rpc-client.js';
import {
  scanNativeTransfers,
  scanSplMintCreates,
  type NativeTransferMatch,
  type SplMintMatch,
} from './transaction-scan.js';

const DEFAULT_SIG_LIMIT = 100;

export function signatureLimitForChallenge(challenge: Challenge): number {
  let max = DEFAULT_SIG_LIMIT;
  for (const task of challenge.tasks) {
    if (task.limit) max = Math.max(max, task.limit);
    if (
      task.type === 'transfer_sent' ||
      task.type === 'transfer_received' ||
      task.type === 'spl_mint_created' ||
      task.type === 'signature_count_min'
    ) {
      max = Math.max(max, task.limit ?? DEFAULT_SIG_LIMIT);
    }
  }
  return max;
}

export function signatureLimitForTask(task: ChallengeTask): number {
  return task.limit ?? DEFAULT_SIG_LIMIT;
}

export class WalletHistoryCache {
  readonly signatures: string[];
  readonly transactions: (ParsedTransactionWithMeta | null)[];
  private _native?: NativeTransferMatch[];
  private _mints?: SplMintMatch[];

  constructor(
    signatures: string[],
    transactions: (ParsedTransactionWithMeta | null)[],
  ) {
    this.signatures = signatures;
    this.transactions = transactions;
  }

  nativeTransfers(wallet: PublicKey): NativeTransferMatch[] {
    if (!this._native) {
      this._native = scanNativeTransfers(wallet, this.transactions, this.signatures);
    }
    return this._native;
  }

  splMints(wallet: PublicKey): SplMintMatch[] {
    if (!this._mints) {
      this._mints = scanSplMintCreates(wallet, this.transactions, this.signatures);
    }
    return this._mints;
  }
}

export async function loadWalletHistory(
  rpc: MultiRpcClient,
  wallet: PublicKey,
  limit: number,
): Promise<WalletHistoryCache> {
  const { signatures, transactions } = await rpc.fetchParsedHistory(wallet, limit);
  return new WalletHistoryCache(signatures, transactions);
}
