import type { Connection } from '@solana/web3.js';
import type { MultiRpcClient } from '../rpc/multi-rpc-client.js';

export async function withRpcFallback<T>(
  rpc: MultiRpcClient,
  fn: (conn: Connection) => Promise<T>,
): Promise<T> {
  try {
    return await fn(rpc.primary);
  } catch (primaryError) {
    if (!rpc.secondary) throw primaryError;
    rpc.warnings.push('Primary RPC failed — fallback to secondary');
    return fn(rpc.secondary);
  }
}
