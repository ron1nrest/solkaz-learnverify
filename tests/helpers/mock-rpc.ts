import { vi } from 'vitest';
import { MultiRpcClient } from '../../src/rpc/multi-rpc-client.js';
import * as transactionScan from '../../src/rpc/transaction-scan.js';
import type { NativeTransferMatch, SplMintMatch } from '../../src/rpc/transaction-scan.js';

export interface MockRpcOptions {
  balanceLamports?: number;
  signatureCount?: number;
  sentTransfer?: NativeTransferMatch;
  receivedTransfer?: NativeTransferMatch;
  splMint?: SplMintMatch;
  tokenAccount?: boolean;
  balanceWarnings?: string[];
}

export function mockRpcClient(options: MockRpcOptions = {}): void {
  const {
    balanceLamports = 200_000_000,
    signatureCount = 5,
    sentTransfer,
    receivedTransfer,
    splMint,
    tokenAccount = false,
    balanceWarnings = [],
  } = options;

  vi.spyOn(MultiRpcClient.prototype, 'getBalanceConsensus').mockResolvedValue({
    lamports: balanceLamports,
    warnings: balanceWarnings,
  });

  vi.spyOn(MultiRpcClient.prototype, 'getConfirmedSignatureCount').mockResolvedValue(
    signatureCount,
  );

  vi.spyOn(transactionScan, 'findNativeTransfer').mockImplementation(
    async (_conn, _wallet, _limit, predicate) => {
      if (sentTransfer && predicate(sentTransfer)) return sentTransfer;
      if (receivedTransfer && predicate(receivedTransfer)) return receivedTransfer;
      return undefined;
    },
  );

  vi.spyOn(transactionScan, 'findSplMintCreate').mockImplementation(
    async (_conn, _wallet, _limit, predicate) => {
      if (splMint && predicate(splMint)) return splMint;
      return undefined;
    },
  );

  vi.spyOn(transactionScan, 'hasTokenAccount').mockResolvedValue({
    found: tokenAccount,
    mint: splMint?.mint,
    address: tokenAccount ? 'TokenAccount111111111111111111111111111111' : undefined,
  });
}

export function restoreRpcMocks(): void {
  vi.restoreAllMocks();
}

export const sampleSentTransfer: NativeTransferMatch = {
  signature: 'sig-sent',
  lamports: 20_000_000,
  direction: 'sent',
  counterparty: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
};

export const sampleReceivedTransfer: NativeTransferMatch = {
  signature: 'sig-received',
  lamports: 5_000_000,
  direction: 'received',
};

export const sampleSplMint: SplMintMatch = {
  signature: 'sig-mint',
  mint: 'Mint11111111111111111111111111111111111111',
  decimals: 9,
};
