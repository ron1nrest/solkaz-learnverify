import type { ChallengeTask, TaskResult } from '../challenge/types.js';
import { lamportsToSol, taskHint, type TaskVerifier, type VerifyContext } from './base.js';

export const balanceMinVerifier: TaskVerifier = {
  type: 'balance_min',

  async verify(ctx: VerifyContext, task: ChallengeTask): Promise<TaskResult> {
    const required = task.lamports ?? 0;
    try {
      const { lamports, warnings } = await ctx.rpc.getBalanceConsensus(ctx.wallet);
      for (const w of warnings) {
        ctx.rpc.warnings.push(w);
      }

      const pass = lamports >= required;
      return {
        name: task.name,
        type: 'balance_min',
        status: pass ? 'pass' : 'fail',
        message: pass
          ? `balance ${lamportsToSol(lamports)} SOL ≥ ${lamportsToSol(required)} SOL`
          : `balance ${lamportsToSol(lamports)} SOL < ${lamportsToSol(required)} SOL`,
        hint: taskHint(
          task,
          `Пополните Devnet-кошелёк до ≥ ${lamportsToSol(required)} SOL (faucet).`,
        ),
        evidence: { lamports, required_lamports: required },
      };
    } catch (e) {
      return {
        name: task.name,
        type: 'balance_min',
        status: 'error',
        message: e instanceof Error ? e.message : String(e),
        hint: taskHint(task, 'Проверьте RPC: learnverify doctor'),
      };
    }
  },
};
