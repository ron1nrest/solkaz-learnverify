import type { ParsedTransactionWithMeta, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { Connection } from '@solana/web3.js';

export interface NativeTransferMatch {
  signature: string;
  lamports: number;
  direction: 'sent' | 'received';
  counterparty?: string;
}

export interface SplMintMatch {
  signature: string;
  mint: string;
  decimals: number;
}

function walletBase58(wallet: PublicKey): string {
  return wallet.toBase58();
}

function accountKeys(tx: ParsedTransactionWithMeta): string[] {
  return tx.transaction.message.accountKeys.map((k) => {
    if (typeof k === 'string') return k;
    if ('pubkey' in k && k.pubkey) {
      return typeof k.pubkey === 'string' ? k.pubkey : k.pubkey.toBase58();
    }
    return String(k);
  });
}

function collectParsedInstructions(tx: ParsedTransactionWithMeta) {
  const outer = tx.transaction.message.instructions;
  const inner =
    tx.meta?.innerInstructions?.flatMap((group) => group.instructions) ?? [];
  return [...outer, ...inner];
}

/** Scan confirmed txs for native SOL sent/received by wallet. */
export function scanNativeTransfers(
  wallet: PublicKey,
  transactions: (ParsedTransactionWithMeta | null)[],
  signatures: string[],
): NativeTransferMatch[] {
  const walletStr = walletBase58(wallet);
  const matches: NativeTransferMatch[] = [];

  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];
    const sig = signatures[i];
    if (!tx?.meta || tx.meta.err !== null || !sig) continue;

    const keys = accountKeys(tx);
    const walletIndex = keys.findIndex((k) => k === walletStr);
    if (walletIndex < 0) continue;

    const pre = tx.meta.preBalances[walletIndex] ?? 0;
    const post = tx.meta.postBalances[walletIndex] ?? 0;
    const delta = post - pre;

    if (delta < 0) {
      const sent = Math.abs(delta);
      let counterparty: string | undefined;
      for (let j = 0; j < keys.length; j++) {
        if (j === walletIndex) continue;
        const otherDelta = (tx.meta.postBalances[j] ?? 0) - (tx.meta.preBalances[j] ?? 0);
        if (otherDelta > 0) {
          counterparty = keys[j];
          break;
        }
      }
      matches.push({
        signature: sig,
        lamports: sent,
        direction: 'sent',
        counterparty,
      });
    } else if (delta > 0) {
      matches.push({
        signature: sig,
        lamports: delta,
        direction: 'received',
      });
    }
  }

  return matches;
}

/** Scan for SPL initializeMint where wallet is mint authority. */
export function scanSplMintCreates(
  wallet: PublicKey,
  transactions: (ParsedTransactionWithMeta | null)[],
  signatures: string[],
): SplMintMatch[] {
  const walletStr = walletBase58(wallet);
  const matches: SplMintMatch[] = [];

  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];
    const sig = signatures[i];
    if (!tx?.meta || tx.meta.err !== null || !sig) continue;

    for (const ix of collectParsedInstructions(tx)) {
      if (!('parsed' in ix) || !ix.parsed || typeof ix.parsed === 'string') continue;
      const parsed = ix.parsed;
      if (parsed.type !== 'initializeMint' && parsed.type !== 'initializeMint2') continue;

      const info = parsed.info as {
        mintAuthority?: string;
        decimals?: number;
        mint?: string;
      };

      if (info.mintAuthority !== walletStr || info.mint === undefined) continue;

      matches.push({
        signature: sig,
        mint: info.mint,
        decimals: info.decimals ?? 0,
      });
    }
  }

  return matches;
}

const PARSED_TX_CHUNK = 5;
const PARSED_TX_DELAY_MS = 350;

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

async function fetchParsedChunk(
  connection: Connection,
  chunk: string[],
  attempt = 0,
): Promise<(ParsedTransactionWithMeta | null)[]> {
  try {
    return await connection.getParsedTransactions(chunk, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const rateLimited = /too many requests|429/i.test(msg);
    if (rateLimited && attempt < 4) {
      await sleep(1000 * (attempt + 1));
      return fetchParsedChunk(connection, chunk, attempt + 1);
    }
    throw e;
  }
}

export async function fetchWalletParsedHistory(
  connection: Connection,
  wallet: PublicKey,
  limit: number,
): Promise<{
  signatures: string[];
  transactions: (ParsedTransactionWithMeta | null)[];
}> {
  const sigs = await connection.getSignaturesForAddress(
    wallet,
    { limit },
    'confirmed',
  );
  const confirmed = sigs.filter((s) => s.err === null);
  const signatures = confirmed.map((s) => s.signature);

  if (signatures.length === 0) {
    return { signatures: [], transactions: [] };
  }

  const transactions: (ParsedTransactionWithMeta | null)[] = [];
  for (let i = 0; i < signatures.length; i += PARSED_TX_CHUNK) {
    const chunk = signatures.slice(i, i + PARSED_TX_CHUNK);
    const batch = await fetchParsedChunk(connection, chunk);
    transactions.push(...batch);
    if (i + PARSED_TX_CHUNK < signatures.length) {
      await sleep(PARSED_TX_DELAY_MS);
    }
  }

  return { signatures, transactions };
}

/** Incremental scan — stops at first matching transfer (saves RPC on busy wallets). */
export async function findNativeTransfer(
  connection: Connection,
  wallet: PublicKey,
  limit: number,
  predicate: (match: NativeTransferMatch) => boolean,
): Promise<NativeTransferMatch | undefined> {
  const sigs = await connection.getSignaturesForAddress(wallet, { limit }, 'confirmed');
  const signatures = sigs.filter((s) => s.err === null).map((s) => s.signature);

  for (let i = 0; i < signatures.length; i += PARSED_TX_CHUNK) {
    const chunk = signatures.slice(i, i + PARSED_TX_CHUNK);
    const txs = await fetchParsedChunk(connection, chunk);
    const matches = scanNativeTransfers(wallet, txs, chunk);
    const found = matches.find(predicate);
    if (found) return found;
    if (i + PARSED_TX_CHUNK < signatures.length) {
      await sleep(PARSED_TX_DELAY_MS);
    }
  }
  return undefined;
}

/** Incremental scan for SPL mint initialize by wallet. */
export async function findSplMintCreate(
  connection: Connection,
  wallet: PublicKey,
  limit: number,
  predicate: (match: SplMintMatch) => boolean,
): Promise<SplMintMatch | undefined> {
  const sigs = await connection.getSignaturesForAddress(wallet, { limit }, 'confirmed');
  const signatures = sigs.filter((s) => s.err === null).map((s) => s.signature);

  for (let i = 0; i < signatures.length; i += PARSED_TX_CHUNK) {
    const chunk = signatures.slice(i, i + PARSED_TX_CHUNK);
    const txs = await fetchParsedChunk(connection, chunk);
    const mints = scanSplMintCreates(wallet, txs, chunk);
    const found = mints.find(predicate);
    if (found) return found;
    if (i + PARSED_TX_CHUNK < signatures.length) {
      await sleep(PARSED_TX_DELAY_MS);
    }
  }
  return undefined;
}

export async function hasTokenAccount(
  connection: Connection,
  wallet: PublicKey,
  mint?: string,
): Promise<{ found: boolean; mint?: string; address?: string }> {
  const accounts = await connection.getParsedTokenAccountsByOwner(wallet, {
    programId: TOKEN_PROGRAM_ID,
  });

  for (const { pubkey, account } of accounts.value) {
    const parsed = account.data;
    if (parsed.program !== 'spl-token' || parsed.parsed.type !== 'account') continue;
    const info = parsed.parsed.info;
    const accountMint = info.mint as string;
    if (mint && accountMint !== mint) continue;
    return { found: true, mint: accountMint, address: pubkey.toBase58() };
  }

  return { found: false };
}
