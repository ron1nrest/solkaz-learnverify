import { readdirSync } from 'node:fs';
import path from 'node:path';
import { loadChallenge } from '../src/challenge/loader.js';
import { getBundledChallengesDir } from '../src/utils/paths.js';

const dir = getBundledChallengesDir();
const files = readdirSync(dir).filter((f) => f.endsWith('.yaml'));

let failed = 0;
for (const file of files) {
  const full = path.join(dir, file);
  try {
    const c = loadChallenge(full);
    console.log(`✓ ${file} (${c.id}, ${c.tasks.length} tasks)`);
  } catch (e) {
    failed++;
    console.error(`✗ ${file}: ${e instanceof Error ? e.message : String(e)}`);
  }
}

if (failed > 0) {
  process.exit(1);
}
console.log(`\n${files.length} challenge(s) OK`);
