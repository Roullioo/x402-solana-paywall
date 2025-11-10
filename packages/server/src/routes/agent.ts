import type { FastifyInstance } from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Chemin depuis packages/server/src/routes/ vers packages/agent/src/
const agentSrcPath = path.resolve(__dirname, '../../../agent/src');

export function registerAgentRoutes(fastify: FastifyInstance) {
  fastify.post('/api/agent/execute', async (request, reply) => {
    let body;
    try {
      body = request.body as { goal?: string; url?: string };
      if (!body.goal || !body.url) {
        return reply.status(400).send({ error: 'Missing goal or url' });
      }
    } catch (error) {
      return reply.status(400).send({ error: 'Invalid request body' });
    }

    const { goal, url } = body;

    try {
      // Import depuis le code source de l'agent (chemin absolu)
      const { runAgent } = await import(path.join(agentSrcPath, 'agent.js'));
      const { loadOrGenerateKeypair } = await import(path.join(agentSrcPath, 'wallet.js'));
      
      const wallet = loadOrGenerateKeypair();
      const result = await runAgent({ goal, url }, wallet);

      if (result.success && result.result) {
        return reply.status(200).send({
          success: true,
          status: result.result.status,
          data: result.result.data,
          paid: result.result.paid,
          txSig: result.result.txSig,
          reference: result.result.reference,
        });
      } else {
        return reply.status(500).send({
          success: false,
          error: result.error || 'Agent execution failed',
        });
      }
    } catch (error) {
      fastify.log.error({ error }, 'Agent execution error');
      return reply.status(500).send({
        success: false,
        error: (error as Error).message,
      });
    }
  });
}

