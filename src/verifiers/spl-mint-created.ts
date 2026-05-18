import type { ChallengeTask, TaskResult } from '../challenge/types.js';
import { findSplMintCreate } from '../rpc/transaction-scan.js';
import { taskHint, type TaskVerifier, type VerifyContext } from './base.js';
import { historyLimit } from './history.js';
import { withRpcFallback } from './rpc-call.js';

export const splMintCreatedVerifier: TaskVerifier = {
  type: 'spl_mint_created',

  async verify(ctx: VerifyContext, task: ChallengeTask): Promise<TaskResult> {
    const decimals = task.decimals ?? 9;

    try {
      const limit = historyLimit(task);
      const match = await withRpcFallback(ctx.rpc, (conn) =>
        findSplMintCreate(conn, ctx.wallet, limit, (m) => m.decimals === decimals),
      );

      const pass = Boolean(match);

      return {
        name: task.name,
        type: 'spl_mint_created',
        status: pass ? 'pass' : 'fail',
        message: pass
          ? `SPL mint создан (decimals=${decimals})`
          : `не найден mint с authority вашего кошелька и decimals=${decimals}`,
        hint: taskHint(
          task,
          `Создайте SPL-токен: spl-token create-token --decimals ${decimals}`,
        ),
        evidence: pass ? { mint: match!.mint, signature: match!.signature, decimals } : { limit },
      };
    } catch (e) {
      return {
        name: task.name,
        type: 'spl_mint_created',
        status: 'error',
        message: e instanceof Error ? e.message : String(e),
        hint: taskHint(task, 'Проверьте RPC: learnverify doctor'),
      };
    }
  },
};
