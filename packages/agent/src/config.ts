import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const ConfigSchema = z.object({
  RPC_URL: z.string().url().default('https://api.devnet.solana.com'),
  X402_HEADER: z.string().default('X-Payment'),
});

export const config = ConfigSchema.parse(process.env);

