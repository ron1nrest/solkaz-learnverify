#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runChallenges } from './commands/challenges.js';
import { runDoctor } from './commands/doctor.js';
import { runListTasks } from './commands/list-tasks.js';
import { runCohort } from './commands/cohort.js';
import { runVerify } from './commands/verify.js';
import { CsvParseError } from './utils/csv.js';
import { ChallengeLoadError } from './challenge/loader.js';

function readPackageVersion(): string {
  try {
    const pkgPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version?: string };
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

async function main(): Promise<void> {
  const program = new Command();

  program
    .name('learnverify')
    .description('SolKaz LearnVerify — Devnet skill verification for Solana education')
    .version(readPackageVersion(), '-V, --version', 'версия');

  program
    .command('doctor')
    .description('проверка Node, RPC Devnet и окружения')
    .option('--config <path>', 'путь к learnverify.config.json')
    .option('--json', 'JSON-вывод')
    .action(async (opts: { config?: string; json?: boolean }) => {
      process.exit(await runDoctor(opts));
    });

  program
    .command('list-tasks')
    .description('список задач в challenge без RPC')
    .requiredOption('-c, --challenge <path>', 'путь к challenge YAML')
    .option('--json', 'JSON-вывод')
    .action(async (opts: { challenge: string; json?: boolean }) => {
      process.exit(await runListTasks({ challenge: opts.challenge, json: opts.json }));
    });

  program
    .command('challenges')
    .description('встроенные challenge из challenges/examples/')
    .option('--json', 'JSON-вывод')
    .action(async (opts: { json?: boolean }) => {
      process.exit(await runChallenges({ json: opts.json }));
    });

  program
    .command('cohort')
    .description('пакетная проверка кошельков из CSV')
    .requiredOption('-c, --challenge <path>', 'путь к challenge YAML')
    .requiredOption('--wallets <path>', 'CSV: wallet,name')
    .requiredOption('--out <path>', 'куда сохранить JSON-отчёт')
    .option('--strict', 'exit 1 если не все кошельки 100%')
    .option('--strict-rpc', 'передаётся в verify для каждого кошелька')
    .option('--delay-ms <n>', 'пауза между кошельками', (v) => parseInt(v, 10))
    .option('--config <path>', 'путь к learnverify.config.json')
    .option('-v, --verbose', 'таблица по каждому кошельку')
    .option('--json', 'только JSON в stdout')
    .action(
      async (opts: {
        challenge: string;
        wallets: string;
        out: string;
        strict?: boolean;
        strictRpc?: boolean;
        delayMs?: number;
        config?: string;
        verbose?: boolean;
        json?: boolean;
      }) => {
        process.exit(await runCohort(opts));
      },
    );

  program
    .command('verify')
    .description('проверка кошелька по challenge на Devnet')
    .requiredOption('-w, --wallet <pubkey>', 'публичный ключ студента')
    .requiredOption('-c, --challenge <path>', 'путь к challenge YAML')
    .option('--json', 'JSON-отчёт')
    .option('--strict-rpc', 'exit 2 при предупреждениях multi-RPC')
    .option('--config <path>', 'путь к learnverify.config.json')
    .action(async (opts: {
      wallet: string;
      challenge: string;
      json?: boolean;
      strictRpc?: boolean;
      config?: string;
    }) => {
      process.exit(
        await runVerify({
          wallet: opts.wallet,
          challenge: opts.challenge,
          json: opts.json,
          strictRpc: opts.strictRpc,
          config: opts.config,
        }),
      );
    });

  try {
    await program.parseAsync(process.argv);
  } catch (e) {
    if (e instanceof ChallengeLoadError) {
      console.error(`Ошибка challenge (${e.path}): ${e.message}`);
      process.exit(2);
    }
    if (e instanceof CsvParseError) {
      console.error(e.line ? `CSV строка ${e.line}: ${e.message}` : `CSV: ${e.message}`);
      process.exit(2);
    }
    throw e;
  }
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(2);
});
