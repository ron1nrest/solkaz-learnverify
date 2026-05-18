import { writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { CsvParseError, parseCohortCsv } from '../../src/utils/csv.js';

describe('parseCohortCsv', () => {
  it('parses wallet and name columns', () => {
    const file = join(tmpdir(), `cohort-${Date.now()}.csv`);
    writeFileSync(
      file,
      'wallet,name\n7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU,Алия\n',
      'utf8',
    );
    try {
      const rows = parseCohortCsv(file);
      expect(rows).toHaveLength(1);
      expect(rows[0]?.name).toBe('Алия');
    } finally {
      unlinkSync(file);
    }
  });

  it('throws without wallet column', () => {
    const file = join(tmpdir(), `cohort-bad-${Date.now()}.csv`);
    writeFileSync(file, 'pubkey\nabc\n', 'utf8');
    try {
      expect(() => parseCohortCsv(file)).toThrow(CsvParseError);
    } finally {
      unlinkSync(file);
    }
  });
});
