import { z } from 'zod';

const hintSchema = z
  .object({
    ru: z.string().optional(),
    en: z.string().optional(),
  })
  .optional();

const taskBase = {
  name: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  hint: hintSchema,
};

const balanceMinTask = z.object({
  ...taskBase,
  type: z.literal('balance_min'),
  lamports: z.number().int().nonnegative(),
});

const signatureCountMinTask = z.object({
  ...taskBase,
  type: z.literal('signature_count_min'),
  count: z.number().int().positive(),
  limit: z.number().int().positive().optional(),
});

const transferSentTask = z.object({
  ...taskBase,
  type: z.literal('transfer_sent'),
  min_lamports: z.number().int().positive(),
  to: z.string().min(32).max(44).optional(),
});

const transferReceivedTask = z.object({
  ...taskBase,
  type: z.literal('transfer_received'),
  min_lamports: z.number().int().positive(),
});

const splMintCreatedTask = z.object({
  ...taskBase,
  type: z.literal('spl_mint_created'),
  decimals: z.number().int().min(0).max(9),
});

const splTokenAccountTask = z.object({
  ...taskBase,
  type: z.literal('spl_token_account'),
  mint: z.string().min(32).max(44).optional(),
});

export const challengeSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  version: z.literal(1),
  network: z.literal('devnet'),
  title: z.object({
    ru: z.string().min(1),
    en: z.string().optional(),
  }),
  description: z
    .object({
      ru: z.string().optional(),
      en: z.string().optional(),
    })
    .optional(),
  estimated_minutes: z.number().positive().optional(),
  tasks: z
    .array(
      z.discriminatedUnion('type', [
        balanceMinTask,
        signatureCountMinTask,
        transferSentTask,
        transferReceivedTask,
        splMintCreatedTask,
        splTokenAccountTask,
      ]),
    )
    .min(1),
});

export type ChallengeInput = z.infer<typeof challengeSchema>;
