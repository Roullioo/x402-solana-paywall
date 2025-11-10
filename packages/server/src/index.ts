import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';
import { registerRoutes } from './routes.js';
import { registerAIRoutes, registerWeatherRoutes, registerCryptoRoutes } from './routes/apis.js';
import { registerAgentRoutes } from './routes/agent.js';
import { paywallMiddleware } from './middleware/paywall.js';
import { getStore } from './store.js';

const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

const start = async () => {
  try {
    await fastify.register(cors, {
      origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
      credentials: true,
    });

    registerRoutes(fastify);

    registerAgentRoutes(fastify);

    fastify.get('/api/demo/sol-price', async (_request, reply) => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd,eur'
        );

        if (!response.ok) {
          throw new Error('CoinGecko API error');
        }

        const data = await response.json() as any;
        const solPrice = data.solana;

        return reply.send({
          asset: 'SOL',
          usd: solPrice.usd,
          eur: solPrice.eur,
          network: 'devnet',
          timestamp: new Date().toISOString(),
          demo: true,
        });
      } catch (error) {
        fastify.log.warn({ error }, 'CoinGecko API call failed, using mock');
        return reply.send({
          asset: 'SOL',
          usd: 105.42,
          eur: 95.38,
          network: 'devnet',
          timestamp: new Date().toISOString(),
          demo: true,
          mode: 'mock',
        });
      }
    });

    fastify.register(async (instance) => {
      instance.addHook('preHandler', paywallMiddleware);
      registerAIRoutes(instance);
      registerWeatherRoutes(instance);
      registerCryptoRoutes(instance);
    });

    await fastify.listen({ port: config.PORT, host: '0.0.0.0' });
    fastify.log.info(`Server listening on port ${config.PORT}`);

    const cleanupInterval = setInterval(async () => {
      try {
        const store = await getStore();
        const cleaned = await store.cleanExpired();
        if (cleaned > 0) {
          fastify.log.info(`Cleaned ${cleaned} expired payment references`);
        }
      } catch (error) {
        fastify.log.error({ error }, 'Error cleaning expired references');
      }
    }, 5 * 60 * 1000);

    process.on('SIGTERM', () => {
      clearInterval(cleanupInterval);
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

