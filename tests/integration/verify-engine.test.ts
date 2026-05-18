import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadChallenge } from '../../src/challenge/loader.js';
import { defaultConfig } from '../../src/config/types.js';
import { getBundledChallengesDir } from '../../src/utils/paths.js';
import { executeVerify, verifyExitCode } from '../../src/verify/engine.js';
import path from 'node:path';
import {
  mockRpcClient,
  restoreRpcMocks,
  sampleReceivedTransfer,
  sampleSentTransfer,
  sampleSplMint,
} from '../helpers/mock-rpc.js';

const WALLET = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';

describe('executeVerify (integration, mocked RPC)', () => {
  beforeEach(() => {
    mockRpcClient();
  });

  afterEach(() => {
    restoreRpcMocks();
  });

  it('week0 — full pass', async () => {
    const challenge = loadChallenge(
      path.join(getBundledChallengesDir(), 'week0-setup.yaml'),
    );
    const report = await executeVerify({
      wallet: WALLET,
      challenge,
      config: defaultConfig(),
    });

    expect(report.success).toBe(true);
    expect(report.passed).toBe(2);
    expect(verifyExitCode(report, false)).toBe(0);
  });

  it('week1 — full pass with mocked transfer', async () => {
    restoreRpcMocks();
    mockRpcClient({ sentTransfer: sampleSentTransfer });

    const challenge = loadChallenge(
      path.join(getBundledChallengesDir(), 'week1-fundamentals.yaml'),
    );
    const report = await executeVerify({
      wallet: WALLET,
      challenge,
      config: defaultConfig(),
    });

    expect(report.success).toBe(true);
    expect(report.passed).toBe(3);
  });

  it('week1 — partial when transfer missing', async () => {
    restoreRpcMocks();
    mockRpcClient({ sentTransfer: undefined });

    const challenge = loadChallenge(
      path.join(getBundledChallengesDir(), 'week1-fundamentals.yaml'),
    );
    const report = await executeVerify({
      wallet: WALLET,
      challenge,
      config: defaultConfig(),
    });

    expect(report.success).toBe(false);
    expect(report.passed).toBe(2);
    expect(verifyExitCode(report, false)).toBe(1);
    const sent = report.tasks.find((t) => t.name === 'sent-to-peer');
    expect(sent?.status).toBe('fail');
  });

  it('week2 — SPL tasks pass with mocks', async () => {
    restoreRpcMocks();
    mockRpcClient({ splMint: sampleSplMint, tokenAccount: true });

    const challenge = loadChallenge(
      path.join(getBundledChallengesDir(), 'week2-spl-intro.yaml'),
    );
    const report = await executeVerify({
      wallet: WALLET,
      challenge,
      config: defaultConfig(),
    });

    expect(report.success).toBe(true);
    expect(report.passed).toBe(3);
  });

  it('week3 — activity pass', async () => {
    restoreRpcMocks();
    mockRpcClient({
      signatureCount: 6,
      receivedTransfer: sampleReceivedTransfer,
    });

    const challenge = loadChallenge(
      path.join(getBundledChallengesDir(), 'week3-activity.yaml'),
    );
    const report = await executeVerify({
      wallet: WALLET,
      challenge,
      config: defaultConfig(),
    });

    expect(report.success).toBe(true);
  });

  it('strict-rpc exits 2 on balance warnings', async () => {
    restoreRpcMocks();
    mockRpcClient({ balanceWarnings: ['drift'] });

    const challenge = loadChallenge(
      path.join(getBundledChallengesDir(), 'week0-setup.yaml'),
    );
    const report = await executeVerify({
      wallet: WALLET,
      challenge,
      config: defaultConfig(),
      strictRpc: true,
    });

    expect(report.rpcWarnings.length).toBeGreaterThan(0);
    expect(verifyExitCode(report, true)).toBe(2);
  });
});
