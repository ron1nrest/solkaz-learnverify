import { Connection } from '@solana/web3.js';
import type { LearnVerifyConfig } from '../config/types.js';

export interface RpcEndpointHealth {
  url: string;
  ok: boolean;
  slot?: number;
  latencyMs?: number;
  version?: string;
  error?: string;
}

export interface RpcHealthReport {
  primary: RpcEndpointHealth;
  secondary?: RpcEndpointHealth;
  slotDrift?: number;
  warnings: string[];
}

const RPC_TIMEOUT_MS = 10_000;

async function probeEndpoint(url: string): Promise<RpcEndpointHealth> {
  const started = Date.now();
  const connection = new Connection(url, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: RPC_TIMEOUT_MS,
  });

  try {
    const [slot, version] = await Promise.all([
      connection.getSlot('confirmed'),
      connection.getVersion(),
    ]);
    return {
      url,
      ok: true,
      slot,
      latencyMs: Date.now() - started,
      version: version['solana-core'],
    };
  } catch (e) {
    return {
      url,
      ok: false,
      latencyMs: Date.now() - started,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function checkRpcHealth(config: LearnVerifyConfig): Promise<RpcHealthReport> {
  const primary = await probeEndpoint(config.rpc.primary);
  const secondaryUrl = config.rpc.secondary;
  const secondary = secondaryUrl ? await probeEndpoint(secondaryUrl) : undefined;

  const warnings: string[] = [];
  let slotDrift: number | undefined;

  if (!primary.ok) {
    warnings.push(`Primary RPC недоступен: ${config.rpc.primary}`);
  }
  if (secondaryUrl && secondary && !secondary.ok) {
    warnings.push(`Secondary RPC недоступен: ${secondaryUrl}`);
  }
  if (primary.ok && secondary?.ok && primary.slot !== undefined && secondary.slot !== undefined) {
    slotDrift = Math.abs(primary.slot - secondary.slot);
    if (slotDrift > 150) {
      warnings.push(
        `Расхождение slot между RPC: ${slotDrift} (primary ${primary.slot}, secondary ${secondary.slot})`,
      );
    }
  }

  return { primary, secondary, slotDrift, warnings };
}

export function createConnection(url: string): Connection {
  return new Connection(url, { commitment: 'confirmed' });
}
