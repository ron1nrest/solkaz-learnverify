import { PublicKey } from '@solana/web3.js';
import type { ParsedTransactionWithMeta } from '@solana/web3.js';
import { describe, expect, it } from 'vitest';
import { scanNativeTransfers, scanSplMintCreates } from '../../src/rpc/transaction-scan.js';

const WALLET = new PublicKey('CuieVDEDcR7F66wnx2jfxrQe8Z8FcpM3xBKdf7whZBD');
const OTHER = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');

function mockTransferTx(
  walletDelta: number,
  otherDelta: number,
): ParsedTransactionWithMeta {
  const walletStr = WALLET.toBase58();
  const otherStr = OTHER.toBase58();
  return {
    meta: {
      err: null,
      preBalances: [1_000_000_000, 500_000_000],
      postBalances: [
        1_000_000_000 + walletDelta,
        500_000_000 + otherDelta,
      ],
      fee: 5000,
      innerInstructions: [],
      logMessages: null,
      preTokenBalances: [],
      postTokenBalances: [],
      rewards: [],
      loadedAddresses: undefined,
      returnData: null,
      computeUnitsConsumed: undefined,
    },
    transaction: {
      message: {
        accountKeys: [
          { pubkey: walletStr, signer: true, writable: true },
          { pubkey: otherStr, signer: false, writable: true },
        ],
        instructions: [],
        recentBlockhash: 'hash',
        addressTableLookups: [],
      },
      signatures: ['sig1'],
    },
  } as unknown as ParsedTransactionWithMeta;
}

describe('scanNativeTransfers', () => {
  it('detects sent transfer', () => {
    const tx = mockTransferTx(-20_000_000, 20_000_000);
    const matches = scanNativeTransfers(WALLET, [tx], ['sig1']);
    expect(matches.some((m) => m.direction === 'sent' && m.lamports >= 20_000_000)).toBe(
      true,
    );
  });

  it('detects received transfer', () => {
    const tx = mockTransferTx(5_000_000, -5_000_000);
    const matches = scanNativeTransfers(WALLET, [tx], ['sig2']);
    expect(matches.some((m) => m.direction === 'received' && m.lamports >= 5_000_000)).toBe(
      true,
    );
  });
});

describe('scanSplMintCreates', () => {
  it('detects initializeMint', () => {
    const walletStr = WALLET.toBase58();
    const tx = {
      meta: { err: null, innerInstructions: [] },
      transaction: {
        message: {
          accountKeys: [{ pubkey: walletStr, signer: true, writable: true }],
          instructions: [
            {
              programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
              parsed: {
                type: 'initializeMint',
                info: {
                  mint: 'Mint11111111111111111111111111111111111111',
                  mintAuthority: walletStr,
                  decimals: 9,
                },
              },
            },
          ],
        },
      },
    } as unknown as ParsedTransactionWithMeta;

    const mints = scanSplMintCreates(WALLET, [tx], ['sig3']);
    expect(mints).toHaveLength(1);
    expect(mints[0]?.decimals).toBe(9);
  });
});
