import pc from 'picocolors';
import type { CohortReport } from './cohort-types.js';

export function formatCohortSummary(report: CohortReport): string {
  const { summary } = report;
  return [
    pc.bold('Cohort report'),
    `${summary.total} wallets | ${pc.green(String(summary.fullPass))} full pass | ${pc.yellow(String(summary.partial))} partial | ${pc.red(String(summary.errors))} error`,
    pc.dim(`Challenge: ${report.challengeId} | ${(report.durationMs / 1000).toFixed(1)}s`),
  ].join('\n');
}

export function formatCohortTable(report: CohortReport, verbose: boolean): string {
  if (!verbose) return '';

  const lines: string[] = ['', pc.dim('wallet'.padEnd(20) + 'name'.padEnd(16) + 'result')];
  for (const row of report.rows) {
    const shortWallet = `${row.wallet.slice(0, 4)}…${row.wallet.slice(-4)}`;
    const name = (row.name ?? '—').slice(0, 14);
    let result: string;
    if (row.error) {
      result = pc.red('error');
    } else if (row.report?.success) {
      result = pc.green(`${row.report.passed}/${row.report.total}`);
    } else if (row.report) {
      result = pc.yellow(`${row.report.passed}/${row.report.total}`);
    } else {
      result = pc.red('?');
    }
    lines.push(`${shortWallet.padEnd(20)}${name.padEnd(16)}${result}`);
  }
  return lines.join('\n');
}

export function cohortExitCode(report: CohortReport, strict: boolean): number {
  if (report.summary.errors > 0) {
    return 2;
  }
  if (strict && report.summary.fullPass < report.summary.total) {
    return 1;
  }
  if (report.summary.fullPass === report.summary.total) {
    return 0;
  }
  return 1;
}
