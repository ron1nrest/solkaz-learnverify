import type { ChallengeTask, TaskResult } from '../challenge/types.js';
import { findNativeTransfer } from '../rpc/transaction-scan.js';
import { lamportsToSol, taskHint, type TaskVerifier, type VerifyContext } from './base.js';
import { historyLimit } from './history.js';
import { withRpcFallback } from './rpc-call.js';

export const transferReceivedVerifier: TaskVerifier = {
  type: 'transfer_received',

  async verify(ctx: VerifyContext, task: ChallengeTask): Promise<TaskResult> {
    const minLamports = task.min_lamports ?? 1;

    try {
      const limit = historyLimit(task);
      const match = await withRpcFallback(ctx.rpc, (conn) =>
        findNativeTransfer(
          conn,
          ctx.wallet,
          limit,
          (t) => t.direction === 'received' && t.lamports >= minLamports,
        ),
      );

      const pass = Boolean(match);

      return {
        name: task.name,
        type: 'transfer_received',
        status: pass ? 'pass' : 'fail',
        message: pass
          ? `входящий перевод ≥ ${lamportsToSol(minLamports)} SOL`
          : `не найден входящий перевод ≥ ${lamportsToSol(minLamports)} SOL`,
        hint: taskHint(
          task,
          `Получите ≥ ${lamportsToSol(minLamports)} SOL от ментора или одногруппника.`,
        ),
        evidence: pass
          ? { signature: match!.signature, lamports: match!.lamports }
          : { limit },
      };
    } catch (e) {
      return {
        name: task.name,
        type: 'transfer_received',
        status: 'error',
        message: e instanceof Error ? e.message : String(e),
        hint: taskHint(task, 'Проверьте RPC: learnverify doctor'),
      };
    }
  },
};
