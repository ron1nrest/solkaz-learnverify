import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import { loadChallenge } from '../challenge/loader.js';
import { loadConfig } from '../config/load.js';
import {
  cohortExitCode,
  formatCohortSummary,
  formatCohortTable,
} from '../report/cohort-formatter.js';
import type { CohortReport, CohortRowResult } from '../report/cohort-types.js';
import { resolveChallengePath } from '../utils/paths.js';
import { CsvParseError, parseCohortCsv } from '../utils/csv.js';
import { executeVerify, verifyExitCode } from '../verify/engine.js';

export interface CohortOptions {
  challenge: string;
  wallets: string;
  out: string;
  config?: string;
  strict?: boolean;
  strictRpc?: boolean;
  delayMs?: number;
  json?: boolean;
  verbose?: boolean;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

export async function runCohort(options: CohortOptions): Promise<number> {
  const started = Date.now();
  const challengePath = resolveChallengePath(options.challenge);
  const challenge = loadChallenge(challengePath);
  const config = loadConfig(options.config);
  const delayMs = options.delayMs ?? config.cohort?.delayMs ?? 200;

  let rows;
  try {
    rows = parseCohortCsv(path.resolve(options.wallets));
  } catch (e) {
    if (e instanceof CsvParseError) {
      console.error(
        e.line ? `CSV строка ${e.line}: ${e.message}` : `CSV: ${e.message}`,
      );
    } else {
      console.error(e instanceof Error ? e.message : String(e));
    }
    return 2;
  }

  const results: CohortRowResult[] = [];
  let fullPass = 0;
  let partial = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    if (!options.json) {
      process.stderr.write(
        pc.dim(`[${i + 1}/${rows.length}] ${row.name ?? row.wallet.slice(0, 8)}… `),
      );
    }

    try {
      const report = await executeVerify({
        wallet: row.wallet,
        challenge,
        config,
        strictRpc: options.strictRpc,
      });
      const exitCode = verifyExitCode(report, options.strictRpc ?? false);

      if (report.success) fullPass++;
      else if (report.tasks.some((t) => t.status === 'error')) errors++;
      else partial++;

      results.push({
        wallet: row.wallet,
        name: row.name,
        line: row.line,
        report,
        exitCode,
      });

      if (!options.json) {
        process.stderr.write(
          report.success
            ? pc.green('✓\n')
            : exitCode === 2
              ? pc.red('!\n')
              : pc.yellow('~\n'),
        );
      }
    } catch (e) {
      errors++;
      const msg = e instanceof Error ? e.message : String(e);
      results.push({
        wallet: row.wallet,
        name: row.name,
        line: row.line,
        error: msg,
        exitCode: 2,
      });
      if (!options.json) {
        process.stderr.write(pc.red(`✗ ${msg}\n`));
      }
    }

    if (i < rows.length - 1 && delayMs > 0) {
      await sleep(delayMs);
    }
  }

  const report: CohortReport = {
    challengeId: challenge.id,
    network: 'devnet',
    generatedAt: new Date().toISOString(),
    summary: {
      total: rows.length,
      fullPass,
      partial,
      errors,
    },
    rows: results,
    durationMs: Date.now() - started,
  };

  const outPath = path.resolve(options.out);
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatCohortSummary(report));
    console.log(formatCohortTable(report, options.verbose ?? false));
    console.log(pc.dim(`Saved: ${outPath}`));
  }

  return cohortExitCode(report, options.strict ?? false);
}
