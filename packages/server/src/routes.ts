import type { FastifyInstance } from 'fastify';
import {
  PaymentRequirementsSchema,
  X402HeaderPayloadSchema,
  VerifyPaymentRequestSchema,
  base64Decode,
  generateUUID,
  addMinutes,
} from '@x402/shared';
import { config } from './config.js';
import { getStore } from './store.js';
import { verifyPayment } from './solana.js';

function getNetworkFromRpcUrl(rpcUrl: string): 'devnet' | 'mainnet-beta' | 'testnet' {
  if (rpcUrl.includes('devnet')) return 'devnet';
  if (rpcUrl.includes('mainnet') || rpcUrl.includes('api.mainnet-beta')) return 'mainnet-beta';
  if (rpcUrl.includes('testnet')) return 'testnet';
  return 'devnet';
}

export function registerRoutes(fastify: FastifyInstance) {
  fastify.get('/healthz', async (_request, reply) => {
    return reply.status(200).send({ status: 'ok' });
  });

  fastify.get('/api/data', async (request, reply) => {
    const headerName = config.X402_HEADER;
    const headerValue = request.headers[headerName.toLowerCase()] as string | undefined;

    if (!headerValue) {
      const reference = generateUUID();
      const expiresAt = addMinutes(new Date(), 5).toISOString();

      const store = await getStore();
      await store.createRef(reference, config.PRICE_LAMPORTS, expiresAt);

      const network = getNetworkFromRpcUrl(config.RPC_URL);
      const requirements = PaymentRequirementsSchema.parse({
        amountLamports: config.PRICE_LAMPORTS,
        receiver: config.RECEIVER_PUBKEY,
        reference,
        network,
        mint: config.USE_SPL ? config.MINT_ADDRESS : null,
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

    if (record.status === 'consumed') {
      return reply.status(200).send({
        data: 'Secret resource for paid users',
        paid: true,
        reference,
        txSig: record.txSig,
      });
    }

    const verifyResult = await verifyPayment({
      txSig,
      reference,
      receiver: config.RECEIVER_PUBKEY,
      amountLamports: config.PRICE_LAMPORTS,
      mint: config.USE_SPL ? config.MINT_ADDRESS : null,
    });

    if (!verifyResult.ok) {
      return reply.status(402).send({ error: verifyResult.reason });
    }

    if (await store.isTransactionUsed(txSig)) {
      return reply.status(400).send({ error: 'Transaction already used (replay attack)' });
    }

    try {
      await store.consumeRef(
        reference,
        txSig,
        verifyResult.payer!,
        verifyResult.amountLamports!
      );
    } catch (error) {
      return reply.status(400).send({ error: (error as Error).message });
    }

    return reply.status(200).send({
      data: 'Secret resource for paid users',
      paid: true,
      reference,
      txSig,
    });
  });

  fastify.post('/api/verify', async (request, reply) => {
    let body;
    try {
      body = VerifyPaymentRequestSchema.parse(request.body);
    } catch (error) {
      return reply.status(400).send({ error: 'Invalid request body' });
    }

    const { txSig, reference } = body;

    const store = await getStore();
    const record = await store.findByReference(reference);
    if (!record) {
      return reply.status(400).send({ ok: false, reason: 'Reference not found' });
    }

    const verifyResult = await verifyPayment({
      txSig,
      reference,
      receiver: config.RECEIVER_PUBKEY,
      amountLamports: config.PRICE_LAMPORTS,
      mint: config.USE_SPL ? config.MINT_ADDRESS : null,
    });

    if (!verifyResult.ok) {
      return reply.status(200).send({ ok: false, reason: verifyResult.reason });
    }

    return reply.status(200).send({
      ok: true,
      txSig,
      payer: verifyResult.payer,
      amountLamports: verifyResult.amountLamports,
    });
  });
}

