import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VerifyReport } from '../../src/challenge/types.js';

const mockExecuteVerify = vi.fn();

vi.mock('../../src/verify/engine.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/verify/engine.js')>();
  return {
    ...actual,
    executeVerify: (...args: unknown[]) => mockExecuteVerify(...args),
  };
});

import { runCohort } from '../../src/commands/cohort.js';

function passReport(wallet: string): VerifyReport {
  return {
    challengeId: 'kz-week0-setup',
    network: 'devnet',
    wallet,
    passed: 2,
    total: 2,
    success: true,
    tasks: [],
    rpcWarnings: [],
    durationMs: 10,
  };
}

describe('runCohort (integration)', () => {
  const dir = join(tmpdir(), `lv-cohort-${Date.now()}`);
  const csvPath = join(dir, 'cohort.csv');
  const outPath = join(dir, 'out.json');

  beforeEach(() => {
    mkdirSync(dir, { recursive: true });
    mockExecuteVerify.mockReset();
  });

  afterEach(() => {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it('writes JSON report and returns 0 when all pass', async () => {
    const w1 = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
    const w2 = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';
    writeFileSync(csvPath, `wallet,name\n${w1},A\n${w2},B\n`);

    mockExecuteVerify
      .mockResolvedValueOnce(passReport(w1))
      .mockResolvedValueOnce(passReport(w2));

    const code = await runCohort({
      challenge: 'week0-setup.yaml',
      wallets: csvPath,
      out: outPath,
      delayMs: 0,
      json: true,
    });

    expect(code).toBe(0);
    expect(mockExecuteVerify).toHaveBeenCalledTimes(2);

    const saved = JSON.parse(readFileSync(outPath, 'utf8')) as {
      summary: { fullPass: number; total: number };
    };
    expect(saved.summary.fullPass).toBe(2);
    expect(saved.summary.total).toBe(2);
  });

  it('returns 1 with --strict when partial', async () => {
    const w1 = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
    writeFileSync(csvPath, `wallet,name\n${w1},A\n`);

    mockExecuteVerify.mockResolvedValueOnce({
      ...passReport(w1),
      success: false,
      passed: 1,
      total: 2,
    });

    const code = await runCohort({
      challenge: 'week0-setup.yaml',
      wallets: csvPath,
      out: outPath,
      delayMs: 0,
      strict: true,
      json: true,
    });

    expect(code).toBe(1);
  });
});
