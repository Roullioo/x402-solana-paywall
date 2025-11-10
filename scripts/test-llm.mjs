#!/usr/bin/env node

const LLM_URL = process.env.LLM_LOCAL_URL || 'http://127.0.0.1:1234';

async function testLLM() {
  console.log('[x402] Testing Local LLM');
  console.log(`[x402] URL: ${LLM_URL}\n`);

  try {
    console.log('[x402] Step 1: Testing connection...');
    const healthCheck = await fetch(LLM_URL).catch(() => null);
    if (healthCheck && healthCheck.ok) {
      console.log('[x402] LLM accessible\n');
    } else {
      console.log('[x402] Healthcheck not available, testing direct API\n');
    }

    console.log('[x402] Step 2: Testing /v1/chat/completions...');
    const response = await fetch(`${LLM_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'local',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.',
          },
          {
            role: 'user',
            content: 'Say "Hello from local LLM" in one sentence.',
          },
        ],
        max_tokens: 50,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[x402] HTTP error ${response.status}: ${errorText}`);
      
      console.log('\n[x402] Step 3: Testing alternative format...');
      const altResponse = await fetch(LLM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Say "Hello from local LLM"',
          max_tokens: 50,
        }),
      });

      if (altResponse.ok) {
        const altData = await altResponse.json();
        console.log('[x402] Alternative format works!');
        console.log('[x402] Response:', JSON.stringify(altData, null, 2));
        return true;
      }

      return false;
    }

    const data = await response.json();
    console.log('[x402] LLM responds correctly!');
    console.log('[x402] Response:', JSON.stringify(data, null, 2));

    if (data.choices && data.choices[0]?.message?.content) {
      console.log(`\n[x402] Content: "${data.choices[0].message.content}"`);
    }

    return true;
  } catch (error) {
    console.error(`[x402] Error: ${error.message}`);
    console.log('\n[x402] Check that your local LLM is running on', LLM_URL);
    return false;
  }
}

testLLM().then((success) => {
  if (success) {
    console.log('\n[x402] LLM test successful!');
    console.log('\n[x402] To use with agent:');
    console.log('[x402] export USE_LOCAL_LLM=true');
    console.log('[x402] export LLM_LOCAL_URL=http://127.0.0.1:1234');
    console.log('[x402] pnpm agent:run "goal" "http://localhost:3000/api/data"');
  } else {
    console.log('\n[x402] LLM test failed');
    process.exit(1);
  }
});
