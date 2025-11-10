interface LLMResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  content?: string;
}

export async function callLLM(
  goal: string,
  paymentRequirements: any,
  policyDecision: { allow: boolean; reason: string }
): Promise<string> {
  const localUrl = process.env.LLM_LOCAL_URL || 'http://127.0.0.1:1234';
  const openaiKey = process.env.OPENAI_API_KEY;
  const useLocal = process.env.USE_LOCAL_LLM === 'true' || !openaiKey;

  if (!useLocal && !openaiKey) {
    return `Policy decision: ${policyDecision.reason}`;
  }

  const url = useLocal ? localUrl : 'https://api.openai.com/v1/chat/completions';
  const model = useLocal 
    ? (process.env.AGENT_MODEL || 'qwen/qwen3-coder-7b')
    : (process.env.AGENT_MODEL || 'gpt-4o-mini');

  const prompt = `You are an AI agent analyzing a payment request.

Goal: ${goal}
Payment amount: ${paymentRequirements.amountLamports} lamports (${(paymentRequirements.amountLamports / 1e9).toFixed(4)} SOL)
Policy decision: ${policyDecision.allow ? 'ALLOW' : 'DENY'}
Policy reason: ${policyDecision.reason}

Provide a brief justification (1-2 sentences) for this payment decision.`;

  try {
    if (useLocal) {
      const response = await fetch(`${localUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that analyzes payment decisions for autonomous agents.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: { message: errorText } };
        }
        
        if (response.status === 404 && errorData.error?.code === 'model_not_found') {
          console.warn(`[x402] Model ${model} not loaded. Attempting to fetch available models...`);
          try {
            const modelsRes = await fetch(`${localUrl}/v1/models`);
            if (modelsRes.ok) {
              const modelsData = await modelsRes.json() as { data?: Array<{ id: string }> };
              const availableModels = modelsData.data?.map((m) => m.id) || [];
              if (availableModels.length > 0) {
                const fallbackModel = availableModels[0];
                console.log(`[x402] Using model: ${fallbackModel}`);
                
                const retryResponse = await fetch(`${localUrl}/v1/chat/completions`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    model: fallbackModel,
                    messages: [
                      { role: 'system', content: 'You are a helpful assistant that analyzes payment decisions for autonomous agents.' },
                      { role: 'user', content: prompt },
                    ],
                    max_tokens: 150,
                    temperature: 0.7,
                  }),
                });
                
                if (retryResponse.ok) {
                  const retryData = (await retryResponse.json()) as LLMResponse;
                  const content = retryData.choices?.[0]?.message?.content || `Policy decision: ${policyDecision.reason}`;
                  return `LLM Local (${fallbackModel}): ${content}`;
                }
              }
            }
          } catch (retryError) {
            console.warn(`[x402] LLM retry failed: ${(retryError as Error).message}`);
            throw new Error(`LLM local API error: ${errorData.error?.message || response.statusText}`);
          }
        }
        
        throw new Error(`LLM local API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = (await response.json()) as LLMResponse;
      const content =
        data.choices?.[0]?.message?.content ||
        data.content ||
        `Policy decision: ${policyDecision.reason}`;

      return `LLM Local (${model}): ${content}`;
    } else {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that analyzes payment decisions for autonomous agents.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = (await response.json()) as LLMResponse;
      const content = data.choices?.[0]?.message?.content || `Policy decision: ${policyDecision.reason}`;

      return `LLM OpenAI: ${content}`;
    }
  } catch (error) {
    console.warn(`[x402] LLM call failed: ${(error as Error).message}`);
    return `Policy decision: ${policyDecision.reason} (LLM unavailable)`;
  }
}

