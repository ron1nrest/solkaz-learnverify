import { hasTokenAccount } from '../rpc/transaction-scan.js';
import type { ChallengeTask, TaskResult } from '../challenge/types.js';
import { taskHint, type TaskVerifier, type VerifyContext } from './base.js';

export const splTokenAccountVerifier: TaskVerifier = {
  type: 'spl_token_account',

  async verify(ctx: VerifyContext, task: ChallengeTask): Promise<TaskResult> {
    try {
      const result = await hasTokenAccount(ctx.rpc.primary, ctx.wallet, task.mint);

      if (!result.found && ctx.rpc.secondary) {
        const secondary = await hasTokenAccount(ctx.rpc.secondary, ctx.wallet, task.mint);
        if (secondary.found) {
          Object.assign(result, secondary);
        }
      }

      const pass = result.found;

      return {
        name: task.name,
        type: 'spl_token_account',
        status: pass ? 'pass' : 'fail',
        message: pass
          ? task.mint
            ? `ATA для mint ${task.mint.slice(0, 8)}… найден`
            : 'найден SPL token account'
          : task.mint
            ? `ATA для указанного mint не найден`
            : 'SPL token account не найден',
        hint: taskHint(
          task,
          task.mint
            ? 'Создайте associated token account для вашего mint.'
            : 'Создайте token account: spl-token create-account <MINT>',
        ),
        evidence: pass
          ? { token_account: result.address, mint: result.mint }
          : undefined,
      };
    } catch (e) {
      return {
        name: task.name,
        type: 'spl_token_account',
        status: 'error',
        message: e instanceof Error ? e.message : String(e),
        hint: taskHint(task, 'Проверьте RPC: learnverify doctor'),
      };
    }
  },
};
