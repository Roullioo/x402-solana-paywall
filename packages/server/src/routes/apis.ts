import type { FastifyInstance } from 'fastify';
import { fetch } from 'undici';
import { createHash } from 'crypto';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
export function registerAIRoutes(fastify: FastifyInstance) {
  fastify.get('/api/ai/summarize', async (request, reply) => {
    const { url } = request.query as { url?: string };

    if (!url) {
      return reply.status(400).send({ error: 'Missing url parameter' });
    }

    try {
      new URL(url);
    } catch {
      return reply.status(400).send({ error: 'Invalid URL' });
    }

    if (OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant that summarizes web pages in 2-3 sentences.',
              },
              {
                role: 'user',
                content: `Summarize this URL: ${url}`,
              },
            ],
            max_tokens: 150,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json() as any;
        const summary = data.choices?.[0]?.message?.content || 'No summary generated';

        return reply.send({
          url,
          summary,
          model: 'gpt-4o-mini',
          mode: 'real',
        });
      } catch (error) {
        fastify.log.error({ error }, 'OpenAI API call failed');
        return reply.status(500).send({ error: 'Failed to generate summary' });
      }
    } else {
      const hostname = new URL(url).hostname;
      const hash = createHash('sha256').update(url).digest('hex').slice(0, 8);
      
      return reply.send({
        url,
        summary: `MOCK: Summary of ${hostname} (hash: ${hash}). This is a deterministic mock response. Set OPENAI_API_KEY to get real summaries.`,
        model: 'mock',
        mode: 'mock',
      });
    }
  });
}

export function registerWeatherRoutes(fastify: FastifyInstance) {
  fastify.get('/api/weather', async (request, reply) => {
    const { city } = request.query as { city?: string };

    if (!city) {
      return reply.status(400).send({ error: 'Missing city parameter' });
    }

    if (OPENWEATHER_API_KEY) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );

        if (!response.ok) {
          if (response.status === 404) {
            return reply.status(404).send({ error: 'City not found' });
          }
          throw new Error(`OpenWeather API error: ${response.statusText}`);
        }

        const data = await response.json() as any;

        return reply.send({
          city: data.name,
          country: data.sys?.country,
          tempC: data.main?.temp,
          feelsLikeC: data.main?.feels_like,
          humidity: data.main?.humidity,
          conditions: data.weather?.[0]?.description,
          mode: 'real',
        });
      } catch (error) {
        fastify.log.error({ error }, 'OpenWeather API call failed');
        return reply.status(500).send({ error: 'Failed to fetch weather data' });
      }
    } else {
      const normalizedCity = city.toLowerCase().replace(/\s+/g, '');
      const temp = 20;

      return reply.send({
        city,
        country: 'MOCK',
        tempC: temp,
        feelsLikeC: temp - 1,
        humidity: 65,
        conditions: 'cloudy (mock)',
        mode: 'mock',
      });
    }
  });
}

export function registerCryptoRoutes(fastify: FastifyInstance) {
  fastify.get('/api/crypto', async (request, reply) => {
    const { asset } = request.query as { asset?: string };

    if (!asset) {
      return reply.status(400).send({ error: 'Missing asset parameter' });
    }

    const coinIdMap: Record<string, string> = {
      sol: 'solana',
      btc: 'bitcoin',
      eth: 'ethereum',
    };
    
    const normalizedAsset = asset.toLowerCase();
    const coinId = coinIdMap[normalizedAsset] || normalizedAsset;
    
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd,eur`
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limited');
        }
        throw new Error(`CoinGecko API error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      if (!data || !data[coinId] || !data[coinId].usd) {
        fastify.log.warn({ asset, coinId, data }, 'Asset not found in CoinGecko, using mock');
        throw new Error('Asset not found');
      }

      return reply.send({
        asset: asset.toUpperCase(),
        coinId,
        usd: data[coinId].usd,
        eur: data[coinId].eur,
        mode: 'real',
      });
    } catch (error) {
      fastify.log.warn({ error, asset }, 'CoinGecko API call failed, using mock');

      const normalizedAsset = asset.toLowerCase();
      const prices = { usd: 100, eur: 90 };

      return reply.send({
        asset: asset.toUpperCase(),
        coinId: normalizedAsset,
        ...prices,
        mode: 'mock',
      });
    }
  });
}

