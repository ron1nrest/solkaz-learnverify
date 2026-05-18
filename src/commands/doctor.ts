import pc from 'picocolors';
import { loadConfig } from '../config/load.js';
import { checkRpcHealth } from '../rpc/multi-provider.js';

export interface DoctorOptions {
  config?: string;
  json?: boolean;
}

export async function runDoctor(options: DoctorOptions): Promise<number> {
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  const config = loadConfig(options.config);
  const rpcReport = await checkRpcHealth(config);

  const lines: string[] = [];
  const nodeOk = nodeMajor >= 20;

  if (options.json) {
    const payload = {
      node: { version: process.version, ok: nodeOk },
      network: config.network,
      rpc: rpcReport,
      ready: nodeOk && rpcReport.primary.ok,
    };
    console.log(JSON.stringify(payload, null, 2));
    return payload.ready ? 0 : 2;
  }

  lines.push(pc.bold('SolKaz LearnVerify — doctor'));
  lines.push('');

  lines.push(
    `${nodeOk ? pc.green('✓') : pc.red('✗')} Node ${process.version}${nodeOk ? '' : ' (требуется ≥ 20)'}`,
  );

  const fmtRpc = (label: string, h: typeof rpcReport.primary) => {
    if (h.ok) {
      lines.push(
        pc.green('✓') +
          ` ${label}: slot ${h.slot} (${h.latencyMs}ms) — ${h.url.replace(/api-key=[^&]+/, 'api-key=***')}`,
      );
    } else {
      lines.push(pc.red('✗') + ` ${label}: ${h.error ?? 'error'} — ${h.url}`);
    }
  };

  fmtRpc('RPC primary', rpcReport.primary);
  if (config.rpc.secondary) {
    fmtRpc('RPC secondary', rpcReport.secondary ?? { url: config.rpc.secondary, ok: false });
  } else {
    lines.push(
      pc.dim('○') +
        ' RPC secondary не задан (опционально: HELIUS_API_KEY или LEARNVERIFY_RPC_SECONDARY)',
    );
  }

  if (rpcReport.slotDrift !== undefined) {
    const driftOk = rpcReport.slotDrift <= 150;
    const icon = driftOk ? pc.green('✓') : pc.yellow('⚠');
    lines.push(
      `${icon} Slot drift: ${rpcReport.slotDrift}${driftOk ? '' : ' — возможна десинхронизация RPC'}`,
    );
  }

  for (const w of rpcReport.warnings) {
    lines.push(pc.yellow('⚠') + ` ${w}`);
  }

  lines.push('');
  const ready = nodeOk && rpcReport.primary.ok;
  lines.push(
    ready
      ? pc.green('Готов к проверке на Devnet.')
      : pc.red('Исправьте ошибки перед verify/cohort.'),
  );

  console.log(lines.join('\n'));
  return ready ? 0 : 2;
}
