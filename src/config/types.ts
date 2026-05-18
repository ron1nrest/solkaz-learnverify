export interface LearnVerifyConfig {
  network: 'devnet';
  rpc: {
    primary: string;
    secondary?: string;
  };
  cohort?: {
    delayMs?: number;
  };
}

export const DEFAULT_DEVNET_RPC = 'https://api.devnet.solana.com';

export function defaultConfig(): LearnVerifyConfig {
  const heliusSecondary = process.env.HELIUS_API_KEY
    ? `https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
    : undefined;

  const secondary =
    process.env.LEARNVERIFY_RPC_SECONDARY ?? heliusSecondary ?? undefined;

  return {
    network: 'devnet',
    rpc: {
      primary: process.env.LEARNVERIFY_RPC_PRIMARY ?? DEFAULT_DEVNET_RPC,
      secondary,
    },
    cohort: { delayMs: 200 },
  };
}
