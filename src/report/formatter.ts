import pc from 'picocolors';
import type { VerifyReport } from '../challenge/types.js';
import { readPackageVersion } from './version.js';

function statusIcon(status: string): string {
  switch (status) {
    case 'pass':
      return pc.green('✓');
    case 'fail':
      return pc.red('✗');
    default:
      return pc.yellow('!');
  }
}

export function formatHumanReport(report: VerifyReport, version: string): string {
  const lines: string[] = [];
  lines.push(pc.bold(`SolKaz LearnVerify v${version}`));
  lines.push(`Challenge: ${report.challengeId} (${report.network})`);
  lines.push(`Wallet: ${report.wallet}`);
  lines.push('');

  for (const task of report.tasks) {
    lines.push(`  ${statusIcon(task.status)} ${task.name.padEnd(22)} ${pc.dim(task.message)}`);
    if (task.status !== 'pass' && task.hint) {
      lines.push(pc.dim(`     → ${task.hint}`));
    }
  }

  lines.push('');
  const pct = report.total > 0 ? Math.round((report.passed / report.total) * 100) : 0;
  lines.push(
    `Result: ${report.passed}/${report.total} passed (${pct}%)`,
  );

  for (const w of report.rpcWarnings) {
    lines.push('');
    lines.push(pc.yellow('⚠ Multi-RPC:') + ` ${w}`);
    lines.push(
      pc.dim('   Не полагайтесь на один RPC — см. docs/student-guide.md#rpc'),
    );
  }

  lines.push('');
  lines.push(pc.dim(`Duration: ${(report.durationMs / 1000).toFixed(1)}s`));
  lines.push(pc.dim(`Exit code: ${report.success ? 0 : report.tasks.some((t) => t.status === 'error') ? 2 : 1}`));

  return lines.join('\n');
}

export function printHumanReport(report: VerifyReport): void {
  console.log(formatHumanReport(report, readPackageVersion()));
}
