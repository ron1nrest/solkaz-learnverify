import type { PublicKey } from '@solana/web3.js';
import type { Challenge, ChallengeTask, TaskResult } from '../challenge/types.js';
import type { MultiRpcClient } from '../rpc/multi-rpc-client.js';
export interface VerifyContext {
  wallet: PublicKey;
  challenge: Challenge;
  rpc: MultiRpcClient;
  strictRpc: boolean;
}

export interface TaskVerifier {
  readonly type: ChallengeTask['type'];
  verify(ctx: VerifyContext, task: ChallengeTask): Promise<TaskResult>;
}

export function taskHint(task: ChallengeTask, fallback: string): string {
  return task.hint?.ru ?? fallback;
}

export function lamportsToSol(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(4);
}
