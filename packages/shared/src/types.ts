import { z } from 'zod';

/**
 * Schema for Payment Requirements returned in 402
 */
export const PaymentRequirementsSchema = z.object({
  amountLamports: z.number().int().positive(),
  receiver: z.string(),
  reference: z.string().uuid(),
  network: z.enum(['devnet', 'mainnet-beta', 'testnet']),
  mint: z.string().nullable().optional(),
  expiresAt: z.string().datetime(),
});

export type PaymentRequirements = z.infer<typeof PaymentRequirementsSchema>;

/**
 * Schema for X402 header (base64 JSON)
 */
export const X402HeaderPayloadSchema = z.object({
  txSig: z.string(),
  reference: z.string().uuid(),
});

export type X402HeaderPayload = z.infer<typeof X402HeaderPayloadSchema>;

/**
 * Schema for payment verification
 */
export const VerifyPaymentRequestSchema = z.object({
  txSig: z.string(),
  reference: z.string().uuid(),
});

export type VerifyPaymentRequest = z.infer<typeof VerifyPaymentRequestSchema>;

export const VerifyPaymentResponseSchema = z.object({
  ok: z.boolean(),
  txSig: z.string().optional(),
  payer: z.string().optional(),
  amountLamports: z.number().int().optional(),
  reason: z.string().optional(),
});

export type VerifyPaymentResponse = z.infer<typeof VerifyPaymentResponseSchema>;

/**
 * Schema for paid resource
 */
export const PaidResourceSchema = z.object({
  data: z.any(),
  paid: z.boolean(),
  reference: z.string().uuid(),
  txSig: z.string(),
});

export type PaidResource = z.infer<typeof PaidResourceSchema>;

