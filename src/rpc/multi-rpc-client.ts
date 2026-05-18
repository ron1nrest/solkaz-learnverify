import {
  Connection,
  PublicKey,
  type ParsedTransactionWithMeta,
} from '@solana/web3.js';
import type { LearnVerifyConfig } from '../config/types.js';
import { createConnection } from './multi-provider.js';
import { fetchWalletParsedHistory } from './transaction-scan.js';

const RETRY_DELAYS_MS = [1000, 2000, 4000];

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < RETRY_DELAYS_MS.length; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (i < RETRY_DELAYS_MS.length - 1) {
        await sleep(RETRY_DELAYS_MS[i] ?? 1000);
      }
    }
  }
  throw new Error(
    `${label}: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

export interface BalanceConsensus {
  lamports: number;
  warnings: string[];
}

export class MultiRpcClient {
  readonly primary: Connection;
  readonly secondary?: Connection;
  readonly warnings: string[] = [];

  constructor(config: LearnVerifyConfig) {
    this.primary = createConnection(config.rpc.primary);
    if (config.rpc.secondary) {
      this.secondary = createConnection(config.rpc.secondary);
    }
  }

  static fromConfig(config: LearnVerifyConfig): MultiRpcClient {
    return new MultiRpcClient(config);
  }

  /** Consensus balance: max of endpoints; warn on mismatch (grant / censorship narrative). */
  async getBalanceConsensus(pubkey: PublicKey): Promise<BalanceConsensus> {
    const warnings: string[] = [];
    const balances: number[] = [];

    const read = async (conn: Connection, label: string) => {
      const lamports = await withRetry(
        () => conn.getBalance(pubkey, 'confirmed'),
        `${label} getBalance`,
      );
      balances.push(lamports);
      return lamports;
    };

    try {
      await read(this.primary, 'primary');
    } catch (e) {
      throw new Error(
        `Primary RPC недоступен: ${e instanceof Error ? e.message : String(e)}`,
      );
    }

    if (this.secondary) {
      try {
        await read(this.secondary, 'secondary');
      } catch {
        warnings.push('Secondary RPC недоступен — используется только primary');
      }
    }

    if (balances.length >= 2) {
      const min = Math.min(...balances);
      const max = Math.max(...balances);
      if (max !== min) {
        warnings.push(
          `Расхождение balance между RPC: min ${min} / max ${max} lamports (используем max)`,
        );
      }
    }

    return { lamports: Math.max(...balances), warnings };
  }

  async getConfirmedSignatureCount(pubkey: PublicKey, limit: number): Promise<number> {
    const fetch = (conn: Connection) =>
      withRetry(
        () =>
          conn.getSignaturesForAddress(pubkey, { limit }, 'confirmed'),
        'getSignaturesForAddress',
      );

    let signatures;
    try {
      signatures = await fetch(this.primary);
    } catch (primaryError) {
      if (!this.secondary) {
        throw primaryError;
      }
      this.warnings.push('Primary RPC failed for signatures — fallback to secondary');
      signatures = await fetch(this.secondary);
    }

    return signatures.filter((s) => s.err === null).length;
  }

  async fetchParsedHistory(
    pubkey: PublicKey,
    limit: number,
  ): Promise<{
    signatures: string[];
    transactions: (ParsedTransactionWithMeta | null)[];
  }> {
    const run = (conn: Connection) => fetchWalletParsedHistory(conn, pubkey, limit);

    try {
      return await run(this.primary);
    } catch (primaryError) {
      if (!this.secondary) {
        throw primaryError;
      }
      this.warnings.push('Primary RPC failed for parsed history — fallback to secondary');
      return await run(this.secondary);
    }
  }
}
