import { describe, expect, it } from 'vitest';
import { formatHumanReport } from '../../src/report/formatter.js';
import type { VerifyReport } from '../../src/challenge/types.js';

describe('formatHumanReport', () => {
  it('includes challenge id and pass count', () => {
    const report: VerifyReport = {
      challengeId: 'kz-week0-setup',
      network: 'devnet',
      wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      passed: 2,
      total: 2,
      success: true,
      tasks: [
        {
          name: 'funded',
          type: 'balance_min',
          status: 'pass',
          message: 'ok',
        },
      ],
      rpcWarnings: [],
      durationMs: 100,
    };

    const text = formatHumanReport(report, '0.1.0');
    expect(text).toContain('kz-week0-setup');
    expect(text).toContain('2/2 passed');
  });
});
