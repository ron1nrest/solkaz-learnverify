import type { ChallengeTask } from '../challenge/types.js';
import { signatureLimitForTask } from '../rpc/wallet-history-cache.js';

export function historyLimit(task: ChallengeTask): number {
  return Math.min(signatureLimitForTask(task), 50);
}
