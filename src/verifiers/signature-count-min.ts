import type { ChallengeTask, TaskResult } from '../challenge/types.js';
import { taskHint, type TaskVerifier, type VerifyContext } from './base.js';

export const signatureCountMinVerifier: TaskVerifier = {
  type: 'signature_count_min',

  async verify(ctx: VerifyContext, task: ChallengeTask): Promise<TaskResult> {
    const required = task.count ?? 1;
    const limit = task.limit ?? 100;

    try {
      const count = await ctx.rpc.getConfirmedSignatureCount(ctx.wallet, limit);
      const pass = count >= required;

      return {
        name: task.name,
        type: 'signature_count_min',
        status: pass ? 'pass' : 'fail',
        message: pass
          ? `подтверждённых транзакций: ${count} ≥ ${required}`
          : `подтверждённых транзакций: ${count} < ${required} (лимит поиска ${limit})`,
        hint: taskHint(
          task,
          `Выполните ещё транзакций на Devnet (нужно ≥ ${required}).`,
        ),
        evidence: { count, required, limit },
      };
    } catch (e) {
      return {
        name: task.name,
        type: 'signature_count_min',
        status: 'error',
        message: e instanceof Error ? e.message : String(e),
        hint: taskHint(task, 'Проверьте RPC: learnverify doctor'),
      };
    }
  },
};
