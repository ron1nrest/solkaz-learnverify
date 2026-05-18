import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Project root (parent of `dist/` when running compiled CLI). */
export function getProjectRoot(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  // src/utils -> ../..  |  dist/utils -> ../..
  return path.resolve(here, '../..');
}

export function getBundledChallengesDir(): string {
  return path.join(getProjectRoot(), 'challenges', 'examples');
}

export function resolveChallengePath(input: string): string {
  if (path.isAbsolute(input) && existsSync(input)) {
    return input;
  }
  const fromCwd = path.resolve(process.cwd(), input);
  if (existsSync(fromCwd)) {
    return fromCwd;
  }
  const fromBundled = path.join(getBundledChallengesDir(), input);
  if (existsSync(fromBundled)) {
    return fromBundled;
  }
  return fromCwd;
}
