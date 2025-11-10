import { Keypair } from '@solana/web3.js';
import { loadPolicyConfig } from './policy.js';
import { fetchWithX402, type FetchResult } from './tools/x402.js';

export interface AgentTask {
  goal: string;
  url: string;
}

export interface AgentResult {
  success: boolean;
  result?: FetchResult;
  error?: string;
}

export async function runAgent(task: AgentTask, wallet: Keypair): Promise<AgentResult> {
  console.log(`[x402] Agent starting task: "${task.goal}"`);
  console.log(`[x402] Target: ${task.url}`);
  console.log(`[x402] Wallet: ${wallet.publicKey.toBase58()}`);

  try {
    const policy = loadPolicyConfig();
    console.log(`[x402] Policy loaded`);
    console.log(`[x402] Max budget: ${policy.maxLamportsPerTask} lamports`);
    console.log(`[x402] Whitelist: ${policy.whitelistHosts.join(', ')}`);

    console.log(`[x402] PLAN: Fetch resource at ${task.url}`);
    console.log(`[x402] ACT: Executing fetch...`);
    const result = await fetchWithX402(task.url, wallet, policy, task.goal);

    console.log(`[x402] OBSERVE: Task completed`);
    console.log(`[x402] Status: ${result.status}`);
    console.log(`[x402] Paid: ${result.paid}`);
    if (result.paid) {
      console.log(`[x402] TxSig: ${result.txSig?.slice(0, 8)}...${result.txSig?.slice(-4)}`);
    }

    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error(`[x402] Agent task failed: ${(error as Error).message}`);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

