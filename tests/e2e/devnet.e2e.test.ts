/**
 * Optional Devnet E2E — runs only when E2E_DEVNET_WALLET is set.
 * Example: E2E_DEVNET_WALLET=<pubkey> npm run test:e2e
 */
import { describe, expect, it } from 'vitest';
import { loadChallenge } from '../../src/challenge/loader.js';
import { defaultConfig } from '../../src/config/types.js';
import { getBundledChallengesDir } from '../../src/utils/paths.js';
import { executeVerify } from '../../src/verify/engine.js';
import path from 'node:path';

const wallet = process.env.E2E_DEVNET_WALLET?.trim();
const describeE2e = wallet ? describe : describe.skip;

describeE2e('Devnet E2E', () => {
  it(
    'week0-setup returns a report (wallet must be funded on Devnet)',
    async () => {
      const challenge = loadChallenge(
        path.join(getBundledChallengesDir(), 'week0-setup.yaml'),
      );
      const report = await executeVerify({
        wallet: wallet!,
        challenge,
        config: defaultConfig(),
      });

      expect(report.challengeId).toBe('kz-week0-setup');
      expect(report.total).toBe(2);
      // Do not assert success — depends on live wallet state
      expect(report.passed).toBeGreaterThanOrEqual(0);
    },
    60_000,
  );
});
