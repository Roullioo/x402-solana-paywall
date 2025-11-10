import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const ConfigSchema = z.object({
  RPC_URL: z.string().url(),
  RECEIVER_PUBKEY: z.string(),
  PRICE_LAMPORTS: z.coerce.number().int().positive(),
  X402_HEADER: z.string().default('X-Payment'),
  SQLITE_PATH: z.string().default('./payments.db'),
  USE_SPL: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
  MINT_ADDRESS: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(3000),
});

export const config = ConfigSchema.parse(process.env);

