import { PublicKey } from '@solana/web3.js';
import type { ChallengeTask, TaskResult } from '../challenge/types.js';
import { findNativeTransfer } from '../rpc/transaction-scan.js';
import { lamportsToSol, taskHint, type TaskVerifier, type VerifyContext } from './base.js';
import { historyLimit } from './history.js';
import { withRpcFallback } from './rpc-call.js';

export const transferSentVerifier: TaskVerifier = {
  type: 'transfer_sent',

  async verify(ctx: VerifyContext, task: ChallengeTask): Promise<TaskResult> {
    const minLamports = task.min_lamports ?? 1;
    let toFilter: string | undefined;
    if (task.to) {
      try {
        toFilter = new PublicKey(task.to).toBase58();
      } catch {
        return {
          name: task.name,
          type: 'transfer_sent',
          status: 'error',
          message: `Некорректный адрес to: ${task.to}`,
        };
      }
    }

    try {
      const limit = historyLimit(task);
      const match = await withRpcFallback(ctx.rpc, (conn) =>
        findNativeTransfer(
          conn,
          ctx.wallet,
          limit,
          (t) =>
            t.direction === 'sent' &&
            t.lamports >= minLamports &&
            (!toFilter || t.counterparty === toFilter),
        ),
      );

      const pass = Boolean(match);

      return {
        name: task.name,
        type: 'transfer_sent',
        status: pass ? 'pass' : 'fail',
        message: pass
          ? `исходящий перевод ≥ ${lamportsToSol(minLamports)} SOL${toFilter ? ` → ${toFilter.slice(0, 8)}…` : ''}`
          : `не найден исходящий перевод ≥ ${lamportsToSol(minLamports)} SOL (проверено ${limit} sig)`,
        hint: taskHint(
          task,
          `Отправьте ≥ ${lamportsToSol(minLamports)} SOL другому Devnet-адресу.`,
        ),
        evidence: pass
          ? { signature: match!.signature, lamports: match!.lamports, counterparty: match!.counterparty }
          : { limit },
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const rateLimited = /too many requests|429/i.test(msg);
      return {
        name: task.name,
        type: 'transfer_sent',
        status: 'error',
        message: rateLimited
          ? 'RPC rate limit — задайте HELIUS_API_KEY или повторите позже'
          : msg,
        hint: taskHint(task, 'Проверьте RPC: learnverify doctor'),
      };
    }
  },
};
