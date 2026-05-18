import { PublicKey } from '@solana/web3.js';
import { describe, expect, it } from 'vitest';
import type { Challenge, ChallengeTask } from '../../src/challenge/types.js';
import { MultiRpcClient } from '../../src/rpc/multi-rpc-client.js';
import { balanceMinVerifier } from '../../src/verifiers/balance-min.js';
import { signatureCountMinVerifier } from '../../src/verifiers/signature-count-min.js';
import { registeredTaskTypes } from '../../src/verifiers/registry.js';
import type { VerifyContext } from '../../src/verifiers/base.js';
import { verifyExitCode } from '../../src/verify/engine.js';

const WALLET = new PublicKey('11111111111111111111111111111111');

function mockChallenge(tasks: ChallengeTask[]): Challenge {
  return {
    id: 'test',
    version: 1,
    network: 'devnet',
    title: { ru: 'Test' },
    tasks,
  };
}

function mockCtx(
  rpc: Pick<MultiRpcClient, 'getBalanceConsensus' | 'getConfirmedSignatureCount' | 'warnings'>,
): VerifyContext {
  return {
    wallet: WALLET,
    challenge: mockChallenge([]),
    rpc: rpc as MultiRpcClient,
    strictRpc: false,
  };
}

describe('balance_min verifier', () => {
  it('passes when balance enough', async () => {
    const ctx = mockCtx({
      warnings: [],
      getBalanceConsensus: async () => ({ lamports: 200_000_000, warnings: [] }),
      getConfirmedSignatureCount: async () => 0,
    });
    const task: ChallengeTask = {
      name: 'funded',
      type: 'balance_min',
      lamports: 100_000_000,
    };
    const result = await balanceMinVerifier.verify(ctx, task);
    expect(result.status).toBe('pass');
  });

  it('fails when balance low', async () => {
    const ctx = mockCtx({
      warnings: [],
      getBalanceConsensus: async () => ({ lamports: 1000, warnings: [] }),
      getConfirmedSignatureCount: async () => 0,
    });
    const result = await balanceMinVerifier.verify(
      ctx,
      { name: 'funded', type: 'balance_min', lamports: 100_000_000 },
    );
    expect(result.status).toBe('fail');
  });
});

describe('signature_count_min verifier', () => {
  it('passes when enough signatures', async () => {
    const ctx = mockCtx({
      warnings: [],
      getBalanceConsensus: async () => ({ lamports: 0, warnings: [] }),
      getConfirmedSignatureCount: async () => 5,
    });
    const result = await signatureCountMinVerifier.verify(ctx, {
      name: 'active',
      type: 'signature_count_min',
      count: 3,
    });
    expect(result.status).toBe('pass');
  });
});

describe('registry', () => {
  it('includes all stage 2 types', () => {
    const types = registeredTaskTypes();
    expect(types).toContain('transfer_sent');
    expect(types).toContain('spl_mint_created');
    expect(types).toContain('spl_token_account');
  });
});

describe('verifyExitCode', () => {
  it('returns 0 on full success', () => {
    const code = verifyExitCode(
      {
        challengeId: 'x',
        network: 'devnet',
        wallet: 'w',
        passed: 1,
        total: 1,
        success: true,
        tasks: [{ name: 'a', type: 'balance_min', status: 'pass', message: 'ok' }],
        rpcWarnings: [],
        durationMs: 1,
      },
      false,
    );
    expect(code).toBe(0);
  });

  it('returns 2 on strict rpc warnings', () => {
    const code = verifyExitCode(
      {
        challengeId: 'x',
        network: 'devnet',
        wallet: 'w',
        passed: 1,
        total: 1,
        success: true,
        tasks: [{ name: 'a', type: 'balance_min', status: 'pass', message: 'ok' }],
        rpcWarnings: ['drift'],
        durationMs: 1,
      },
      true,
    );
    expect(code).toBe(2);
  });
});
