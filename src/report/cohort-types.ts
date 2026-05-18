import type { VerifyReport } from '../challenge/types.js';

export interface CohortRowResult {
  wallet: string;
  name?: string;
  line: number;
  report?: VerifyReport;
  error?: string;
  exitCode: number;
}

export interface CohortReport {
  challengeId: string;
  network: 'devnet';
  generatedAt: string;
  summary: {
    total: number;
    fullPass: number;
    partial: number;
    errors: number;
  };
  rows: CohortRowResult[];
  durationMs: number;
}
