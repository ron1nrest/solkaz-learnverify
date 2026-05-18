import { loadConfig } from '../config/load.js';
import { loadChallenge } from '../challenge/loader.js';
import { resolveChallengePath } from '../utils/paths.js';
import { executeVerify, verifyExitCode } from '../verify/engine.js';
import { printHumanReport } from '../report/formatter.js';

export interface VerifyOptions {
  wallet: string;
  challenge: string;
  config?: string;
  json?: boolean;
  strictRpc?: boolean;
}

export async function runVerify(options: VerifyOptions): Promise<number> {
  const challengePath = resolveChallengePath(options.challenge);
  const challenge = loadChallenge(challengePath);
  const config = loadConfig(options.config);

  let report;
  try {
    report = await executeVerify({
      wallet: options.wallet,
      challenge,
      config,
      strictRpc: options.strictRpc,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/too many requests|429/i.test(msg)) {
      console.error(
        'RPC rate limit. Подождите 1 минуту, уменьшите limit в challenge или задайте HELIUS_API_KEY.',
      );
    } else {
      console.error(msg);
    }
    return 2;
  }

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printHumanReport(report);
  }

  return verifyExitCode(report, options.strictRpc ?? false);
}
