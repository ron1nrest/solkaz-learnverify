import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..', 'src');
const BANNED = [/secretKey/i, /fromSecretKey/i, /mnemonic/i, /seed phrase/i];

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      files.push(...walk(full));
    } else if (name.endsWith('.ts')) {
      files.push(full);
    }
  }
  return files;
}

let failed = false;
for (const file of walk(ROOT)) {
  const content = readFileSync(file, 'utf8');
  for (const pattern of BANNED) {
    if (pattern.test(content)) {
      console.error(`✗ ${path.relative(process.cwd(), file)}: matches ${pattern}`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}
console.log('✓ security-check: no private key patterns in src/');
