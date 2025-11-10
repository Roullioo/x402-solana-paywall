import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  PaymentRequirementsSchema,
  X402HeaderPayloadSchema,
  base64Decode,
  generateUUID,
  addMinutes,
} from '@x402/shared';
import { getStore } from '../store.js';
import { verifyPayment } from '../solana.js';

function getNetworkFromRpcUrl(rpcUrl: string): 'devnet' | 'mainnet-beta' | 'testnet' {
  if (rpcUrl.includes('devnet')) return 'devnet';
  if (rpcUrl.includes('mainnet') || rpcUrl.includes('api.mainnet-beta')) return 'mainnet-beta';
  if (rpcUrl.includes('testnet')) return 'testnet';
  return 'devnet';
}

const config = {
  RPC_URL: process.env.RPC_URL || 'https://api.devnet.solana.com',
  RECEIVER_PUBKEY: process.env.RECEIVER_PUBKEY || '',
  PRICE_LAMPORTS: parseInt(process.env.PRICE_LAMPORTS || '5000', 10),
  X402_HEADER: process.env.X402_HEADER || 'X-Payment',
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  get network() {
    return getNetworkFromRpcUrl(this.RPC_URL);
  },
};

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientId(request: FastifyRequest): string {
  return request.ip || request.headers['x-forwarded-for'] as string || 'unknown';
}

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientId);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(clientId, {
      count: 1,
      resetAt: now + config.RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (record.count >= config.RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, config.RATE_LIMIT_WINDOW_MS);

export async function paywallMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const headerName = config.X402_HEADER;
  const headerValue = request.headers[headerName.toLowerCase()] as string | undefined;

  if (!headerValue) {
    const clientId = getClientId(request);
    if (!checkRateLimit(clientId)) {
      return reply.status(429).send({ 
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((rateLimitMap.get(clientId)?.resetAt || Date.now() + config.RATE_LIMIT_WINDOW_MS - Date.now()) / 1000),
      });
    }

    const store = await getStore();
    const pendingRefs = await store.getAllPending();
    const now = new Date();
    
    for (const ref of pendingRefs) {
      if (new Date(ref.expiresAt) < now) {
        await store.cleanExpired();
        break;
      }
    }

    const reference = generateUUID();
    const expiresAt = addMinutes(new Date(), 5).toISOString();

    await store.createRef(reference, config.PRICE_LAMPORTS, expiresAt);

    const requirements = PaymentRequirementsSchema.parse({
      amountLamports: config.PRICE_LAMPORTS,
      receiver: config.RECEIVER_PUBKEY,
      reference,
      network: config.network,
      mint: null,
      expiresAt,
    });

    return reply.status(402).send(requirements);
  }

  let payload;
  try {
    const decoded = base64Decode(headerValue);
    payload = X402HeaderPayloadSchema.parse(JSON.parse(decoded));
  } catch (error) {
    return reply.status(400).send({ error: 'Invalid X402 header format' });
  }

  const { txSig, reference } = payload;

  const store = await getStore();

  const record = await store.findByReference(reference);
  if (!record) {
    return reply.status(400).send({ error: 'Invalid or expired reference' });
  }

  const now = new Date();
  if (new Date(record.expiresAt) < now && record.status === 'pending') {
    return reply.status(400).send({ error: 'Reference expired' });
  }

  if (record.status === 'consumed') {
    request.log.info({ reference, txSig: record.txSig }, 'Payment already verified (cached)');
    return;
  }

  const verifyResult = await verifyPayment({
    txSig,
    reference,
    receiver: config.RECEIVER_PUBKEY,
    amountLamports: config.PRICE_LAMPORTS,
    mint: null,
  });

  if (!verifyResult.ok) {
    return reply.status(402).send({ error: verifyResult.reason });
  }

  if (await store.isTransactionUsed(txSig)) {
    return reply.status(400).send({ error: 'Transaction already used (replay attack)' });
  }

  try {
    await store.consumeRef(reference, txSig, verifyResult.payer!, verifyResult.amountLamports!);
    request.log.info({ reference, txSig: txSig.slice(0, 8) + '...' + txSig.slice(-4), payer: verifyResult.payer }, 'Payment verified and consumed');
  } catch (error) {
    return reply.status(400).send({ error: (error as Error).message });
  }
}

