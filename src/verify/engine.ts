import type { Challenge, VerifyReport } from '../challenge/types.js';
import { MultiRpcClient } from '../rpc/multi-rpc-client.js';
import { parseWalletAddress } from '../utils/pubkey.js';
import type { LearnVerifyConfig } from '../config/types.js';
import { runTask } from '../verifiers/registry.js';
import type { VerifyContext } from '../verifiers/base.js';

export interface RunVerifyOptions {
  wallet: string;
  challenge: Challenge;
  config: LearnVerifyConfig;
  strictRpc?: boolean;
}

export async function executeVerify(options: RunVerifyOptions): Promise<VerifyReport> {
  const started = Date.now();
  const wallet = parseWalletAddress(options.wallet);
  const rpc = MultiRpcClient.fromConfig(options.config);

  const ctx: VerifyContext = {
    wallet,
    challenge: options.challenge,
    rpc,
    strictRpc: options.strictRpc ?? false,
  };

  const tasks = [];
  for (const task of options.challenge.tasks) {
    tasks.push(await runTask(ctx, task));
  }

  const rpcWarnings = [...rpc.warnings];
  if (options.strictRpc && rpcWarnings.length > 0) {
    for (const t of tasks) {
      if (t.status === 'pass') {
        // downgrade not needed; report warnings separately
      }
    }
  }

  const passed = tasks.filter((t) => t.status === 'pass').length;
  const hasError = tasks.some((t) => t.status === 'error');
  const allPass = passed === tasks.length && !hasError;

  return {
    challengeId: options.challenge.id,
    network: 'devnet',
    wallet: wallet.toBase58(),
    passed,
    total: tasks.length,
    success: allPass,
    tasks,
    rpcWarnings,
    durationMs: Date.now() - started,
  };
}

export function verifyExitCode(
  report: VerifyReport,
  strictRpc: boolean,
): number {
  if (strictRpc && report.rpcWarnings.length > 0) {
    return 2;
  }
  if (report.tasks.some((t) => t.status === 'error')) {
    return 2;
  }
  if (report.success) {
    return 0;
  }
  return 1;
}
