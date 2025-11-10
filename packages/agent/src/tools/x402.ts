import { Keypair } from '@solana/web3.js';
import { PaymentRequirementsSchema, base64Encode, withRetry } from '@x402/shared';
import { sendPaymentWithMemo, waitForConfirmation } from '../pay.js';
import { shouldPay, type PolicyConfig } from '../policy.js';
import { callLLM } from '../llm.js';

const X402_HEADER = process.env.X402_HEADER || 'X-Payment';

export interface FetchResult {
  status: number;
  data: any;
  paid: boolean;
  txSig?: string;
  reference?: string;
}

export async function fetchWithX402(
  url: string,
  wallet: Keypair,
  policy: PolicyConfig,
  goal?: string
): Promise<FetchResult> {
  console.log(`[x402] Fetching: ${url}`);

  let response = await withRetry(
    () => fetch(url),
    { maxRetries: 3, initialDelay: 500 }
  );

  if (response.status !== 402) {
    const data = await response.text();
    console.log(`[x402] Status: ${response.status} (no payment required)`);
    return { status: response.status, data, paid: false };
  }

  console.log(`[x402] Status 402 - Payment required`);
  const requirements = PaymentRequirementsSchema.parse(await response.json());

  console.log(`[x402] Payment Requirements:`);
  console.log(`[x402] Amount: ${requirements.amountLamports} lamports`);
  console.log(`[x402] Receiver: ${requirements.receiver}`);
  console.log(`[x402] Reference: ${requirements.reference}`);

  const host = new URL(url).host;
  const decision = shouldPay(host, requirements.amountLamports, policy);

  if (!decision.allow) {
    console.log(`[x402] Payment denied: ${decision.reason}`);
    throw new Error(`Payment denied by policy: ${decision.reason}`);
  }

  if (goal) {
    const justification = await callLLM(goal, requirements, decision);
    console.log(`[x402] ${justification}`);
  }

  console.log(`[x402] Sending payment...`);
  const txSig = await sendPaymentWithMemo(
    wallet,
    requirements.receiver,
    requirements.amountLamports,
    requirements.reference
  );
  const txSigShort = txSig.slice(0, 8) + '...' + txSig.slice(-4);
  console.log(`[x402] Payment sent! Signature: ${txSigShort}`);

  console.log(`[x402] Waiting for confirmation...`);
  await waitForConfirmation(txSig);
  console.log(`[x402] Transaction confirmed!`);

  const headerPayload = JSON.stringify({ txSig, reference: requirements.reference });
  const headerValue = base64Encode(headerPayload);

  console.log(`[x402] Re-fetching with ${X402_HEADER} header...`);
  response = await withRetry(
    async () => {
      const res = await fetch(url, {
        headers: {
          [X402_HEADER]: headerValue,
        },
      });
      if (!res.ok && res.status !== 200) {
        throw new Error(`Re-fetch failed with status ${res.status}`);
      }
      return res;
    },
    { maxRetries: 5, initialDelay: 1000, maxDelay: 10000, backoff: 2 }
  );

  const data = await response.text();
  console.log(`[x402] Status: ${response.status}`);

  return {
    status: response.status,
    data,
    paid: true,
    txSig,
    reference: requirements.reference,
  };
}

