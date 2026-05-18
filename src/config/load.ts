import { readFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { defaultConfig, type LearnVerifyConfig } from './types.js';

const configSchema = z.object({
  network: z.literal('devnet').optional(),
  rpc: z
    .object({
      primary: z.string().url(),
      secondary: z.string().url().optional(),
    })
    .optional(),
  cohort: z
    .object({
      delayMs: z.number().int().positive().optional(),
    })
    .optional(),
});

export function loadConfig(configPath?: string): LearnVerifyConfig {
  const base = defaultConfig();
  const candidates = [
    configPath,
    process.env.LEARNVERIFY_CONFIG,
    path.join(process.cwd(), 'learnverify.config.json'),
  ].filter((p): p is string => Boolean(p));

  for (const candidate of candidates) {
    try {
      const raw = JSON.parse(readFileSync(candidate, 'utf8')) as unknown;
      const parsed = configSchema.parse(raw);
      return {
        network: 'devnet',
        rpc: {
          primary: parsed.rpc?.primary ?? base.rpc.primary,
          secondary: parsed.rpc?.secondary ?? base.rpc.secondary,
        },
        cohort: { ...base.cohort, ...parsed.cohort },
      };
    } catch {
      // try next path
    }
  }

  return base;
}
