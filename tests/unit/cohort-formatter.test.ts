import { describe, expect, it } from 'vitest';
import { cohortExitCode } from '../../src/report/cohort-formatter.js';
import type { CohortReport } from '../../src/report/cohort-types.js';

function mockReport(overrides: Partial<CohortReport['summary']>): CohortReport {
  return {
    challengeId: 'test',
    network: 'devnet',
    generatedAt: '',
    durationMs: 1,
    summary: {
      total: 3,
      fullPass: 2,
      partial: 1,
      errors: 0,
      ...overrides,
    },
    rows: [],
  };
}

describe('cohortExitCode', () => {
  it('returns 0 when all pass', () => {
    expect(cohortExitCode(mockReport({ total: 2, fullPass: 2, partial: 0 }), false)).toBe(0);
  });

  it('returns 1 in strict mode with partial', () => {
    expect(cohortExitCode(mockReport({ total: 2, fullPass: 1, partial: 1 }), true)).toBe(1);
  });

  it('returns 2 when errors present', () => {
    expect(cohortExitCode(mockReport({ errors: 1 }), false)).toBe(2);
  });
});
