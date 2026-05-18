import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import type { Challenge } from './types.js';
import { challengeSchema } from './schema.js';

export class ChallengeLoadError extends Error {
  constructor(
    message: string,
    readonly path: string,
  ) {
    super(message);
    this.name = 'ChallengeLoadError';
  }
}

export function loadChallenge(filePath: string): Challenge {
  let raw: unknown;
  try {
    raw = parse(readFileSync(filePath, 'utf8'));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new ChallengeLoadError(`Не удалось прочитать YAML: ${msg}`, filePath);
  }

  const result = challengeSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new ChallengeLoadError(`Невалидный challenge:\n${issues}`, filePath);
  }

  return result.data as Challenge;
}
