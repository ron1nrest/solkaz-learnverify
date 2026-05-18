import type { ChallengeTask, TaskResult } from '../challenge/types.js';
import type { TaskVerifier, VerifyContext } from './base.js';
import { balanceMinVerifier } from './balance-min.js';
import { signatureCountMinVerifier } from './signature-count-min.js';
import { transferSentVerifier } from './transfer-sent.js';
import { transferReceivedVerifier } from './transfer-received.js';
import { splMintCreatedVerifier } from './spl-mint-created.js';
import { splTokenAccountVerifier } from './spl-token-account.js';

const registry = new Map<string, TaskVerifier>();

export function registerVerifier(verifier: TaskVerifier): void {
  registry.set(verifier.type, verifier);
}

export function getVerifier(type: string): TaskVerifier | undefined {
  return registry.get(type);
}

export function registeredTaskTypes(): string[] {
  return [...registry.keys()].sort();
}

export async function runTask(
  ctx: VerifyContext,
  task: ChallengeTask,
): Promise<TaskResult> {
  const verifier = getVerifier(task.type);
  if (verifier) {
    return verifier.verify(ctx, task);
  }

  return {
    name: task.name,
    type: task.type,
    status: 'error',
    message: `Неизвестный тип задачи: ${task.type}`,
    hint: `Доступные типы: ${registeredTaskTypes().join(', ')}`,
  };
}

registerVerifier(balanceMinVerifier);
registerVerifier(signatureCountMinVerifier);
registerVerifier(transferSentVerifier);
registerVerifier(transferReceivedVerifier);
registerVerifier(splMintCreatedVerifier);
registerVerifier(splTokenAccountVerifier);
