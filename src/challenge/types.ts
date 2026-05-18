export type TaskType =
  | 'balance_min'
  | 'signature_count_min'
  | 'transfer_sent'
  | 'transfer_received'
  | 'spl_mint_created'
  | 'spl_token_account';

export interface TaskHint {
  ru?: string;
  en?: string;
}

export interface ChallengeTask {
  name: string;
  type: TaskType;
  hint?: TaskHint;
  lamports?: number;
  count?: number;
  limit?: number;
  min_lamports?: number;
  to?: string;
  decimals?: number;
  mint?: string;
}

export interface Challenge {
  id: string;
  version: number;
  network: 'devnet';
  title: { ru: string; en?: string };
  description?: { ru?: string; en?: string };
  estimated_minutes?: number;
  tasks: ChallengeTask[];
}

export type TaskStatus = 'pass' | 'fail' | 'error';

export interface TaskResult {
  name: string;
  type: TaskType;
  status: TaskStatus;
  message: string;
  hint?: string;
  evidence?: Record<string, unknown>;
}

export interface VerifyReport {
  challengeId: string;
  network: 'devnet';
  wallet: string;
  passed: number;
  total: number;
  success: boolean;
  tasks: TaskResult[];
  rpcWarnings: string[];
  durationMs: number;
}
