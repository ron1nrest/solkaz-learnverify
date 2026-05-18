import { readFileSync } from 'node:fs';

export interface CohortWalletRow {
  wallet: string;
  name?: string;
  line: number;
}

export class CsvParseError extends Error {
  constructor(
    message: string,
    readonly line?: number,
  ) {
    super(message);
    this.name = 'CsvParseError';
  }
}

/** Minimal CSV parser (comma-separated, optional quotes). */
function parseLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

export function parseCohortCsv(filePath: string): CohortWalletRow[] {
  const raw = readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  if (lines.length < 2) {
    throw new CsvParseError('CSV должен содержать заголовок и минимум одну строку');
  }

  const header = parseLine(lines[0]!).map((h) => h.toLowerCase());
  const walletIdx = header.indexOf('wallet');
  if (walletIdx < 0) {
    throw new CsvParseError('Колонка "wallet" обязательна в заголовке CSV');
  }
  const nameIdx = header.indexOf('name');

  const rows: CohortWalletRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const lineNum = i + 1;
    const fields = parseLine(lines[i]!);
    const wallet = fields[walletIdx]?.trim();
    if (!wallet) {
      throw new CsvParseError('Пустой wallet', lineNum);
    }
    const name = nameIdx >= 0 ? fields[nameIdx]?.trim() : undefined;
    rows.push({
      wallet,
      name: name || undefined,
      line: lineNum,
    });
  }

  return rows;
}
