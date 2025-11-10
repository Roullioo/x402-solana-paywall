'use client';

import { useState } from 'react';
import Link from 'next/link';

const sections = [
  { id: 'overview', title: 'Overview' },
  { id: 'installation', title: 'Installation' },
  { id: 'networks', title: 'Devnet vs Mainnet' },
  { id: 'quickstart', title: 'Quick Start' },
  { id: 'architecture', title: 'Architecture' },
  { id: 'usage', title: 'Usage Without Agent' },
  { id: 'agent', title: 'Agent CLI' },
  { id: 'server', title: 'Server API' },
  { id: 'shared', title: 'Shared Package' },
  { id: 'configuration', title: 'Configuration' },
  { id: 'security', title: 'Security' },
  { id: 'development', title: 'Development' },
  { id: 'deployment', title: 'Deployment' },
  { id: 'troubleshooting', title: 'Troubleshooting' },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative flex max-w-7xl mx-auto">
          {/* Sidebar */}
          <aside className="hidden lg:block w-72 min-h-screen bg-black/80 backdrop-blur-sm border-r border-gray-800 p-6 sticky top-0 overflow-y-auto">
            <Link href="/" className="text-2xl font-bold mb-8 text-white block hover:opacity-80 transition-opacity">
              x402
            </Link>
            <nav className="space-y-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Documentation</div>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-all text-sm ${
                    activeSection === section.id
                      ? 'bg-white/10 text-white border border-white/20 font-medium'
                      : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 px-6 lg:px-12 py-12">
            <div className="max-w-4xl">
              <div className="mb-12">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors mb-6 inline-flex items-center gap-2 group">
                  <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Home
                </Link>
                <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">
                  Documentation
                </h1>
                <p className="text-xl text-gray-300">
                  Complete guide to x402 Solana Paywall Protocol
                </p>
              </div>

              {/* Overview */}
              {activeSection === 'overview' && (
                <section className="space-y-6 animate-fade-in">
                  <div className="glass rounded-2xl border border-gray-800 p-8">
                    <h2 className="text-3xl font-semibold text-white mb-4">What is x402?</h2>
                    <p className="text-gray-300 text-lg mb-4">
                      x402 is an implementation of the HTTP 402 Payment Required protocol on Solana. 
                      It enables pay-per-use API access through Solana micropayments with an autonomous AI agent 
                      that automatically handles payment detection, policy-based decisions, and on-chain verification.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                      <div className="bg-black/50 rounded-lg p-4 border border-gray-700">
                        <h3 className="text-lg font-semibold text-green-400 mb-2">Key Features</h3>
                        <ul className="space-y-2 text-gray-300 text-sm">
                          <li>• HTTP 402 Payment Required protocol</li>
                          <li>• Autonomous AI agent with policy control</li>
                          <li>• On-chain verification with strict validation</li>
                          <li>• Idempotence & anti-replay protection</li>
                          <li>• Rate limiting & automatic cleanup</li>
                          <li>• Retry logic with exponential backoff</li>
                        </ul>
                      </div>
                      <div className="bg-black/50 rounded-lg p-4 border border-gray-700">
                        <h3 className="text-lg font-semibold text-pink-400 mb-2">Tech Stack</h3>
                        <ul className="space-y-2 text-gray-300 text-sm">
                          <li>• TypeScript (strict mode)</li>
                          <li>• Solana Web3.js</li>
                          <li>• Fastify (server)</li>
                          <li>• Next.js (web interface)</li>
                          <li>• Zod (validation)</li>
                          <li>• Keyv (storage)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="glass rounded-2xl border border-gray-800 p-8">
                    <h2 className="text-3xl font-semibold text-purple-400 mb-4">Project Structure</h2>
                    <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`x402-solana-paywall/
├── packages/
│   ├── shared/          # Types & utils (Zod schemas, retry logic)
│   ├── server/           # API Fastify + on-chain verification
│   └── agent/            # CLI autonomous agent
├── apps/
│   └── web/              # Next.js demo interface
├── scripts/
│   ├── e2e.mjs           # End-to-end tests
│   └── agent-run.mjs     # Agent runner wrapper
└── .github/workflows/
    └── ci.yml            # CI/CD pipeline`}
                    </pre>
                  </div>
                </section>
              )}

              {/* Installation */}
              {activeSection === 'installation' && (
                <section className="space-y-6 animate-fade-in">
                  <div className="glass rounded-2xl border border-gray-800 p-8">
                    <h2 className="text-3xl font-semibold text-purple-400 mb-4">Prerequisites</h2>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-3">
                        <span className="text-green-400 mt-1">✓</span>
                        <span><strong>Node.js</strong> LTS {'>='} 20.0.0</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-400 mt-1">✓</span>
                        <span><strong>pnpm</strong> {'>='} 8.0.0 (package manager)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-400 mt-1">✓</span>
                        <span><strong>Solana CLI</strong> (optional, for wallet management)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="glass rounded-2xl border border-gray-800 p-8">
                    <h2 className="text-3xl font-semibold text-purple-400 mb-4">Installation Steps</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-2">1. Clone Repository</h3>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`git clone https://github.com/your-repo/x402-solana-paywall
cd x402-solana-paywall`}
                        </pre>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-2">2. Install Dependencies</h3>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`pnpm install`}
                        </pre>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-2">3. Generate Receiver Keypair</h3>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`cd packages/server
pnpm receiver:keygen
# Copy RECEIVER_PUBKEY to packages/server/.env`}
                        </pre>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-2">4. Configure Environment</h3>
                        <p className="text-gray-300 mb-2">Create <code className="bg-black/50 px-2 py-1 rounded">packages/server/.env</code>:</p>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`RPC_URL=https://api.devnet.solana.com
RECEIVER_PUBKEY=HfJGGs4xrRHcujrUJBWZnvBBzfCgKUBSacEdSy6kgMq8
PRICE_LAMPORTS=5000
PORT=3000`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Networks */}
              {activeSection === 'networks' && (
                <section className="space-y-6 animate-fade-in">
                  <div className="glass rounded-2xl border border-gray-800 p-8">
                    <h2 className="text-3xl font-semibold text-purple-400 mb-4">Devnet vs Mainnet</h2>
                    <p className="text-gray-300 mb-6">
                      The x402 protocol works on both Solana Devnet (for testing) and Mainnet (for production).
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-green-400 mb-3">Devnet (Testing)</h3>
                        <ul className="space-y-2 text-gray-300 text-sm mb-4">
                          <li className="flex items-start gap-2">
                            <span className="text-green-400 mt-1">✓</span>
                            <span><strong>Free SOL:</strong> Airdrops available for testing</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-400 mt-1">✓</span>
                            <span><strong>No real money:</strong> Safe for development</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-400 mt-1">✓</span>
                            <span><strong>Fast:</strong> Lower network congestion</span>
                          </li>
                        </ul>
                        <div className="bg-black/50 rounded-lg p-4 border border-gray-700">
                          <code className="text-green-400 text-sm">RPC_URL=https://api.devnet.solana.com</code>
                        </div>
                      </div>

                      <div className="bg-purple-900/20 border border-purple-700/50 rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-purple-400 mb-3">Mainnet (Production)</h3>
                        <ul className="space-y-2 text-gray-300 text-sm mb-4">
                          <li className="flex items-start gap-2">
                            <span className="text-purple-400 mt-1">⚠</span>
                            <span><strong>Real SOL:</strong> Transactions cost real money</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-400 mt-1">⚠</span>
                            <span><strong>No airdrops:</strong> Must fund wallets manually</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-400 mt-1">✓</span>
                            <span><strong>Production ready:</strong> Real transactions</span>
                          </li>
                        </ul>
                        <div className="bg-black/50 rounded-lg p-4 border border-gray-700">
                          <code className="text-purple-400 text-sm">RPC_URL=https://api.mainnet-beta.solana.com</code>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-3">Setting Up Devnet</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-300 mb-2">1. Configure Server</h4>
                            <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`# packages/server/.env
RPC_URL=https://api.devnet.solana.com
RECEIVER_PUBKEY=YourReceiverPubkey
PRICE_LAMPORTS=5000`}
                            </pre>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-300 mb-2">2. Configure Agent</h4>
                            <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`# packages/agent/.env
RPC_URL=https://api.devnet.solana.com`}
                            </pre>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-300 mb-2">3. Get Devnet SOL (Airdrop)</h4>
                            <p className="text-gray-400 text-sm mb-2">
                              <strong>Note:</strong> Airdrops are only available on Devnet, not Mainnet.
                            </p>
                            <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`# Generate agent wallet
pnpm agent:keygen

# Request devnet airdrop (free SOL for testing)
pnpm agent:airdrop 0.1

# Check balance
pnpm agent:balance`}
                            </pre>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-purple-400 mb-3">Setting Up Mainnet</h3>
                        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 mb-4">
                          <p className="text-yellow-300 text-sm font-semibold mb-2">⚠️ Important Warnings:</p>
                          <ul className="text-gray-300 text-sm space-y-1">
                            <li>• Mainnet uses <strong>real SOL</strong> - transactions cost real money</li>
                            <li>• No airdrops available - you must fund wallets manually</li>
                            <li>• Use a dedicated receiver wallet (separate from devnet)</li>
                            <li>• Consider using a custom RPC provider (Helius, QuickNode) for better performance</li>
                            <li>• Always test thoroughly on Devnet before using Mainnet</li>
                          </ul>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-300 mb-2">1. Configure Server</h4>
                            <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`# packages/server/.env
RPC_URL=https://api.mainnet-beta.solana.com
# Or use a custom RPC provider:
# RPC_URL=https://your-mainnet-rpc.com
RECEIVER_PUBKEY=YourMainnetReceiverPubkey
PRICE_LAMPORTS=5000`}
                            </pre>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-300 mb-2">2. Configure Agent</h4>
                            <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`# packages/agent/.env
RPC_URL=https://api.mainnet-beta.solana.com`}
                            </pre>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-300 mb-2">3. Fund Wallets</h4>
                            <p className="text-gray-400 text-sm mb-2">
                              You must manually fund your agent wallet with real SOL. No airdrops available on Mainnet.
                            </p>
                            <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`# Transfer SOL from your main wallet to agent wallet
# Use Phantom, Solflare, or CLI tools

# Check balance
pnpm agent:balance`}
                            </pre>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-blue-400 mb-2">Network Detection</h4>
                        <p className="text-gray-300 text-sm">
                          The system automatically detects the network from the RPC_URL:
                        </p>
                        <ul className="text-gray-300 text-sm mt-2 space-y-1">
                          <li>• <code className="bg-black/50 px-1 rounded">https://api.devnet.solana.com</code> → devnet</li>
                          <li>• <code className="bg-black/50 px-1 rounded">https://api.mainnet-beta.solana.com</code> → mainnet-beta</li>
                          <li>• Custom RPCs are detected by checking for "devnet" or "mainnet" in the URL</li>
                        </ul>
                        <p className="text-gray-400 text-sm mt-3">
                          <strong>Important:</strong> The agent and server must use the <strong>same network</strong> (devnet or mainnet) for payments to work.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Quick Start */}
              {activeSection === 'quickstart' && (
                <section className="space-y-6 animate-fade-in">
                  <div className="glass rounded-2xl border border-gray-800 p-8">
                    <h2 className="text-3xl font-semibold text-purple-400 mb-4">Quick Start</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-2">1. Start Server</h3>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`pnpm server:dev`}
                        </pre>
                        <p className="text-gray-400 text-sm mt-2">Server runs on http://localhost:3000</p>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-2">2. Setup Agent</h3>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`# Generate agent wallet
pnpm agent:keygen

# Request devnet airdrop (only works on Devnet, not Mainnet)
pnpm agent:airdrop 0.1`}
                        </pre>
                        <p className="text-gray-400 text-sm mt-2">
                          <strong>Note:</strong> Airdrops are only available on Devnet. For Mainnet, you must manually fund your wallet.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-2">3. Run Agent</h3>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`pnpm agent:run "get protected resource" "http://localhost:3000/api/data"`}
                        </pre>
                        <p className="text-gray-400 text-sm mt-2">
                          The agent will automatically detect 402, pay, and retrieve the resource.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Architecture */}
              {activeSection === 'architecture' && (
                <section className="space-y-6 animate-fade-in">
                  <div className="glass rounded-2xl border border-gray-800 p-8">
                    <h2 className="text-3xl font-semibold text-purple-400 mb-4">System Flow</h2>
                    <ol className="space-y-4 text-gray-300">
                      <li className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">1</span>
                        <div>
                          <strong className="text-purple-400">Client Request</strong>
                          <p className="text-sm text-gray-400">Client requests GET /api/* without X-Payment header</p>
                        </div>
                      </li>
                      <li className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">2</span>
                        <div>
                          <strong className="text-pink-400">402 Response</strong>
                          <p className="text-sm text-gray-400">Server responds with 402 Payment Required + PaymentRequirements (amount, receiver, reference UUID)</p>
                        </div>
                      </li>
                      <li className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">3</span>
                        <div>
                          <strong className="text-green-400">Agent Decision</strong>
                          <p className="text-sm text-gray-400">AI agent checks policy (budget, whitelist) and optionally consults LLM</p>
                        </div>
                      </li>
                      <li className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">4</span>
                        <div>
                          <strong className="text-purple-400">Payment</strong>
                          <p className="text-sm text-gray-400">Agent sends Solana transaction: SystemProgram.transfer + Memo(reference)</p>
                        </div>
                      </li>
                      <li className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">5</span>
                        <div>
                          <strong className="text-pink-400">Confirmation</strong>
                          <p className="text-sm text-gray-400">Agent waits for on-chain confirmation (finalized)</p>
                        </div>
                      </li>
                      <li className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">6</span>
                        <div>
                          <strong className="text-green-400">Re-fetch</strong>
                          <p className="text-sm text-gray-400">Agent re-fetches with X-Payment header (base64 JSON: {`{txSig, reference}`})</p>
                        </div>
                      </li>
                      <li className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">7</span>
                        <div>
                          <strong className="text-purple-400">Verification</strong>
                          <p className="text-sm text-gray-400">Server verifies on-chain: receiver, amount, memo, idempotence, anti-replay</p>
                        </div>
                      </li>
                      <li className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">8</span>
                        <div>
                          <strong className="text-pink-400">Success</strong>
                          <p className="text-sm text-gray-400">Server returns 200 OK + protected resource</p>
                        </div>
                      </li>
                    </ol>
                  </div>
                </section>
              )}

              {/* Usage Without Agent */}
              {activeSection === 'usage' && (
                <section className="space-y-6 animate-fade-in">
                  <div className="glass rounded-2xl border border-gray-800 p-8">
                    <h2 className="text-3xl font-semibold text-white mb-4">Using x402 Without the AI Agent</h2>
                    <p className="text-gray-300 mb-6">
                      The AI agent is optional - you can use the x402 protocol manually. The agent just automates the payment flow.
                    </p>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-3">Manual Flow</h3>
                        <ol className="space-y-3 text-gray-300 mb-6">
                          <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white font-bold">1</span>
                            <div>
                              <strong className="text-white">Make initial request</strong>
                              <p className="text-sm text-gray-400">GET /api/data (without X-Payment header)</p>
                            </div>
                          </li>
                          <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white font-bold">2</span>
                            <div>
                              <strong className="text-white">Receive 402 Payment Required</strong>
                              <p className="text-sm text-gray-400">Server responds with PaymentRequirements JSON</p>
                            </div>
                          </li>
                          <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white font-bold">3</span>
                            <div>
                              <strong className="text-white">Send Solana payment</strong>
                              <p className="text-sm text-gray-400">Transfer SOL with memo containing the reference UUID</p>
                            </div>
                          </li>
                          <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white font-bold">4</span>
                            <div>
                              <strong className="text-white">Wait for confirmation</strong>
                              <p className="text-sm text-gray-400">Wait for transaction to be confirmed on-chain</p>
                            </div>
                          </li>
                          <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white font-bold">5</span>
                            <div>
                              <strong className="text-white">Re-request with header</strong>
                              <p className="text-sm text-gray-400">GET /api/data with X-Payment header (base64 JSON)</p>
                            </div>
                          </li>
                          <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white font-bold">6</span>
                            <div>
                              <strong className="text-white">Receive resource</strong>
                              <p className="text-sm text-gray-400">Server verifies payment and returns 200 OK + data</p>
                            </div>
                          </li>
                        </ol>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-3">JavaScript/TypeScript Example</h3>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`import { 
  Connection, 
  Keypair, 
  PublicKey, 
  SystemProgram, 
  Transaction, 
  TransactionInstruction,
  sendAndConfirmTransaction 
} from '@solana/web3.js';
import { base64Encode } from '@x402/shared';

async function fetchWithPayment(url: string, wallet: Keypair) {
  // Step 1: Initial request
  let response = await fetch(url);
  
  if (response.status !== 402) {
    return await response.json();
  }
  
  // Step 2: Parse PaymentRequirements
  const requirements = await response.json();
  // {
  //   amountLamports: 5000,
  //   receiver: "HfJGGs4xrRHcujrUJBWZnvBBzfCgKUBSacEdSy6kgMq8",
  //   reference: "550e8400-e29b-41d4-a716-446655440000",
  //   network: "devnet",
  //   expiresAt: "2025-11-08T12:05:00.000Z"
  // }
  
  // Step 3: Send Solana payment
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const receiverPubkey = new PublicKey(requirements.receiver);
  
  const transaction = new Transaction();
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: receiverPubkey,
      lamports: requirements.amountLamports,
    })
  );
  
  // Add memo with reference
  const memoProgramId = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
  transaction.add(
    new TransactionInstruction({
      keys: [],
      programId: memoProgramId,
      data: Buffer.from(requirements.reference, 'utf-8'),
    })
  );
  
  // Step 4: Send and wait for confirmation
  const txSig = await sendAndConfirmTransaction(
    connection,
    transaction,
    [wallet],
    { commitment: 'confirmed' }
  );
  
  // Step 5: Re-request with X-Payment header
  const headerPayload = JSON.stringify({
    txSig,
    reference: requirements.reference,
  });
  const headerValue = base64Encode(headerPayload);
  
  response = await fetch(url, {
    headers: {
      'X-Payment': headerValue,
    },
  });
  
  return await response.json();
}

// Usage
const wallet = Keypair.fromSecretKey(/* your secret key */);
const data = await fetchWithPayment('http://localhost:3000/api/data', wallet);`}
                        </pre>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-3">Using the CLI (Without AI Agent)</h3>
                        <p className="text-gray-300 mb-3">
                          The agent CLI has a <code className="bg-black/50 px-1 rounded">fetch</code> command that doesn't use the AI agent:
                        </p>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`# This command doesn't use the AI agent, just handles the payment flow
pnpm agent:fetch "http://localhost:3000/api/data"`}
                        </pre>
                        <p className="text-gray-400 text-sm mt-2">
                          This command will detect 402, send payment, wait for confirmation, and re-fetch automatically - but without policy checks or LLM justification.
                        </p>
                      </div>

                      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-blue-400 mb-2">When to Use Manual vs Agent</h4>
                        <ul className="text-gray-300 text-sm space-y-2">
                          <li><strong className="text-white">Manual:</strong> Simple integrations, custom payment logic, direct control</li>
                          <li><strong className="text-white">Agent:</strong> Automated workflows, policy-based decisions, LLM justification, multiple requests</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Agent CLI */}
              {activeSection === 'agent' && (
                <section className="space-y-6 animate-fade-in">
                  <div className="glass rounded-2xl border border-gray-800 p-8">
                    <h2 className="text-3xl font-semibold text-purple-400 mb-4">Agent CLI Commands</h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-2">keygen</h3>
                        <p className="text-gray-300 mb-2">Generate a new keypair for the agent</p>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`pnpm agent:keygen
# Creates ~/.x402-agent/keypair.json`}
                        </pre>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-2">balance</h3>
                        <p className="text-gray-300 mb-2">Display wallet balance</p>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`pnpm agent:balance`}
                        </pre>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-2">airdrop &lt;amount&gt;</h3>
                        <p className="text-gray-300 mb-2">Request devnet airdrop (in SOL)</p>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`pnpm agent:airdrop 0.1`}
                        </pre>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-2">run &lt;goal&gt; &lt;url&gt;</h3>
                        <p className="text-gray-300 mb-2">Run autonomous agent with goal and target URL</p>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`pnpm agent:run "get protected resource" "http://localhost:3000/api/data"`}
                        </pre>
                        <p className="text-gray-400 text-sm mt-2">
                          The agent will automatically detect 402, check policy, pay if authorized, and retrieve the resource.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-2">pay &lt;receiver&gt; &lt;lamports&gt; [--reference]</h3>
                        <p className="text-gray-300 mb-2">Send manual payment with memo</p>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`pnpm agent:pay HfJGGs4xrRHcujrUJBWZnvBBzfCgKUBSacEdSy6kgMq8 5000 --reference "test-ref"`}
                        </pre>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-2">fetch &lt;url&gt;</h3>
                        <p className="text-gray-300 mb-2">Fetch a resource protected by 402 paywall (without AI agent)</p>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`pnpm agent:fetch "http://localhost:3000/api/data"`}
                        </pre>
                        <p className="text-gray-400 text-sm mt-2">
                          This command handles the payment flow automatically but doesn't use policy checks or LLM justification.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="glass rounded-2xl border border-gray-800 p-8">
                    <h2 className="text-3xl font-semibold text-white mb-4">Testing the CLI</h2>
                    <p className="text-gray-300 mb-6">
                      Complete step-by-step guide to test all CLI commands:
                    </p>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-3">Step 1: Start the Server</h3>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700 mb-3">
{`# Terminal 1: Start the server
pnpm server:dev`}
                        </pre>
                        <p className="text-gray-400 text-sm">Server should be running on http://localhost:3000</p>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-3">Step 2: Setup Agent Wallet</h3>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700 mb-3">
{`# Terminal 2: Generate wallet
pnpm agent:keygen

# Check balance (should be 0)
pnpm agent:balance

# Request devnet airdrop (only works on Devnet!)
pnpm agent:airdrop 0.1

# Verify balance
pnpm agent:balance`}
                        </pre>
                        <p className="text-gray-400 text-sm">You should see your public key and balance after airdrop</p>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-3">Step 3: Test Manual Payment</h3>
                        <p className="text-gray-300 mb-2">First, get your receiver public key from the server:</p>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700 mb-3">
{`# Check server .env or logs for RECEIVER_PUBKEY
# Then send a test payment
pnpm agent:pay <RECEIVER_PUBKEY> 5000 --reference "test-manual-payment"`}
                        </pre>
                        <p className="text-gray-400 text-sm">This sends 5000 lamports (0.000005 SOL) to the receiver</p>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-3">Step 4: Test Fetch (Without AI Agent)</h3>
                        <p className="text-gray-300 mb-3">Test with a protected endpoint (requires payment):</p>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700 mb-3">
{`# Fetch protected resource (automatic payment, no AI)
pnpm agent:fetch "http://localhost:3000/api/data"`}
                        </pre>
                        <p className="text-gray-400 text-sm mb-3">Or test with the free demo endpoint (no payment required):</p>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700 mb-3">
{`# Get SOL price (free demo endpoint, no 402)
pnpm agent:fetch "http://localhost:3000/api/demo/sol-price"`}
                        </pre>
                        <p className="text-gray-400 text-sm mb-3">Expected output for protected endpoint:</p>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`[x402] Fetch: http://localhost:3000/api/data
[x402] Status 402 - Payment required
[x402] Payment Requirements:
[x402] Amount: 5000 lamports
[x402] Receiver: HfJGGs4xrRHcujrUJBWZnvBBzfCgKUBSacEdSy6kgMq8
[x402] Reference: 550e8400-e29b-41d4-a716-446655440000
[x402] Network: devnet
[x402] Sending payment...
[x402] Payment sent!
[x402] Signature: 3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy...
[x402] Waiting for confirmation...
[x402] Transaction confirmed!
[x402] Re-fetching with X-Payment header...
[x402] Status: 200
[x402] Response: {"data":"Secret resource for paid users","paid":true,...}`}
                        </pre>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-3">Step 5: Test AI Agent (Full Flow)</h3>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700 mb-3">
{`# Run autonomous agent with goal
pnpm agent:run "get protected resource" "http://localhost:3000/api/data"`}
                        </pre>
                        <p className="text-gray-400 text-sm mb-3">Expected output (with policy checks and optional LLM):</p>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`[x402] Agent starting task: "get protected resource"
[x402] Target: http://localhost:3000/api/data
[x402] Policy loaded - Checking authorization...
[x402] Payment authorized by policy
[x402] Fetching: http://localhost:3000/api/data
[x402] Status 402 - Payment required
[x402] Payment Requirements: ...
[x402] Sending payment...
[x402] Payment sent! Signature: ...
[x402] Transaction confirmed!
[x402] Re-fetching with X-Payment header...
[x402] Status: 200
[x402] Task completed successfully!`}
                        </pre>
                      </div>

                      <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-yellow-400 mb-2">Troubleshooting</h4>
                        <ul className="text-gray-300 text-sm space-y-2">
                          <li><strong className="text-white">"Insufficient funds":</strong> Run <code className="bg-black/50 px-1 rounded">pnpm agent:airdrop 0.1</code> (devnet only)</li>
                          <li><strong className="text-white">"Connection refused":</strong> Make sure server is running with <code className="bg-black/50 px-1 rounded">pnpm server:dev</code></li>
                          <li><strong className="text-white">"Payment denied by policy":</strong> Check <code className="bg-black/50 px-1 rounded">AGENT_WHITELIST_HOSTS</code> in <code className="bg-black/50 px-1 rounded">packages/agent/.env</code></li>
                          <li><strong className="text-white">"Transaction failed":</strong> Check your wallet balance and network (devnet vs mainnet)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="glass rounded-2xl border border-gray-800 p-8">
                    <h2 className="text-3xl font-semibold text-purple-400 mb-4">Agent Policy</h2>
                    <p className="text-gray-300 mb-4">
                      The agent uses a policy system to control payment decisions:
                    </p>
                    <div className="bg-black/50 rounded-lg p-4 border border-gray-700 mb-4">
                      <h3 className="text-lg font-semibold text-green-400 mb-2">Policy Configuration</h3>
                      <pre className="text-sm text-gray-300 overflow-x-auto">
{`# packages/agent/.env
AGENT_MAX_LAMPORTS_PER_TASK=500000  # Max budget per task
AGENT_WHITELIST_HOSTS=localhost:3000,api.trusted.com`}
                      </pre>
                    </div>
                    <ul className="space-y-2 text-gray-300">
                      <li>• <strong>Budget Control:</strong> Maximum lamports per task</li>
                      <li>• <strong>Whitelist:</strong> Only pay for whitelisted hosts</li>
                      <li>• <strong>LLM Justification:</strong> Optional LLM consultation before payment</li>
                    </ul>
                  </div>
                </section>
              )}

              {/* Server API */}
              {activeSection === 'server' && (
                <section className="space-y-6 animate-fade-in">
                  <div className="glass rounded-2xl border border-gray-800 p-8">
                    <h2 className="text-3xl font-semibold text-purple-400 mb-4">Server Endpoints</h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-2">GET /healthz</h3>
                        <p className="text-gray-300 mb-2">Health check endpoint</p>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`curl http://localhost:3000/healthz
# → {"status":"ok"}`}
                        </pre>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-2">GET /api/data</h3>
                        <p className="text-gray-300 mb-2">Protected resource endpoint</p>
                        <div className="space-y-3">
                          <div>
                            <p className="text-yellow-400 font-semibold mb-1">Without X-Payment header:</p>
                            <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`curl http://localhost:3000/api/data
# → 402 Payment Required
{
  "amountLamports": 5000,
  "receiver": "HfJGGs4xrRHcujrUJBWZnvBBzfCgKUBSacEdSy6kgMq8",
  "reference": "550e8400-e29b-41d4-a716-446655440000",
  "network": "devnet",
  "expiresAt": "2025-11-08T12:05:00.000Z"
}`}
                            </pre>
                          </div>
                          <div>
                            <p className="text-green-400 font-semibold mb-1">With X-Payment header:</p>
                            <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`curl -H "X-Payment: eyJ0eFNpZyI6IjNKOT..." \\
     http://localhost:3000/api/data
# → 200 OK
{
  "data": "Protected resource content",
  "paid": true,
  "reference": "550e8400-e29b-41d4-a716-446655440000",
  "txSig": "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy..."
}`}
                            </pre>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-2">POST /api/agent/execute</h3>
                        <p className="text-gray-300 mb-2">Execute agent programmatically</p>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`curl -X POST http://localhost:3000/api/agent/execute \\
  -H "Content-Type: application/json" \\
  -d '{"goal": "get protected resource", "url": "http://localhost:3000/api/data"}'`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Shared Package */}
              {activeSection === 'shared' && (
                <section className="space-y-6 animate-fade-in">
                  <div className="glass rounded-2xl border border-gray-800 p-8">
                    <h2 className="text-3xl font-semibold text-purple-400 mb-4">@x402/shared Package</h2>
                    <p className="text-gray-300 mb-6">
                      The shared package contains common types, schemas, and utilities used across all packages.
                    </p>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-3">Zod Schemas</h3>
                        <div className="bg-black/50 rounded-lg p-4 border border-gray-700 space-y-3">
                          <div>
                            <code className="text-purple-400 font-mono">PaymentRequirementsSchema</code>
                            <p className="text-gray-400 text-sm mt-1">Schema for 402 Payment Required response</p>
                            <pre className="text-xs text-gray-300 mt-2 bg-gray-900 p-2 rounded">
{`{
  amountLamports: number,
  receiver: string,
  reference: string (UUID),
  network: 'devnet' | 'mainnet-beta' | 'testnet',
  mint: string | null,
  expiresAt: string (ISO datetime)
}`}
                            </pre>
                          </div>
                          <div>
                            <code className="text-purple-400 font-mono">X402HeaderPayloadSchema</code>
                            <p className="text-gray-400 text-sm mt-1">Schema for X-Payment header payload</p>
                            <pre className="text-xs text-gray-300 mt-2 bg-gray-900 p-2 rounded">
{`{
  txSig: string,
  reference: string (UUID)
}`}
                            </pre>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-3">Utility Functions</h3>
                        <div className="bg-black/50 rounded-lg p-4 border border-gray-700 space-y-3">
                          <div>
                            <code className="text-purple-400 font-mono">generateUUID()</code>
                            <p className="text-gray-400 text-sm mt-1">Generates a UUID v4 for payment references</p>
                          </div>
                          <div>
                            <code className="text-purple-400 font-mono">base64Encode(data: string)</code>
                            <p className="text-gray-400 text-sm mt-1">Encodes string to base64 for X-Payment header</p>
                          </div>
                          <div>
                            <code className="text-purple-400 font-mono">base64Decode(data: string)</code>
                            <p className="text-gray-400 text-sm mt-1">Decodes base64 string</p>
                          </div>
                          <div>
                            <code className="text-purple-400 font-mono">withRetry(fn, options)</code>
                            <p className="text-gray-400 text-sm mt-1">Retry function with exponential backoff</p>
                            <pre className="text-xs text-gray-300 mt-2 bg-gray-900 p-2 rounded">
{`withRetry(
  () => fetch(url),
  { maxRetries: 3, initialDelay: 1000, backoff: 2 }
)`}
                            </pre>
                          </div>
                          <div>
                            <code className="text-purple-400 font-mono">addMinutes(date, minutes)</code>
                            <p className="text-gray-400 text-sm mt-1">Adds minutes to a date (for expiration)</p>
                          </div>
                          <div>
                            <code className="text-purple-400 font-mono">sleep(ms)</code>
                            <p className="text-gray-400 text-sm mt-1">Async sleep utility</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Configuration */}
              {activeSection === 'configuration' && (
                <section className="space-y-6 animate-fade-in">
                  <div className="glass rounded-2xl border border-gray-800 p-8">
                    <h2 className="text-3xl font-semibold text-purple-400 mb-4">Environment Variables</h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-3">Server Configuration (packages/server/.env)</h3>
                        <div className="bg-black/50 rounded-lg p-4 border border-gray-700">
                          <table className="w-full text-sm text-gray-300">
                            <thead>
                              <tr className="border-b border-gray-700">
                                <th className="text-left py-2 text-purple-400">Variable</th>
                                <th className="text-left py-2 text-purple-400">Required</th>
                                <th className="text-left py-2 text-purple-400">Description</th>
                              </tr>
                            </thead>
                            <tbody className="space-y-2">
                              <tr className="border-b border-gray-800">
                                <td className="py-2 font-mono text-green-400">RPC_URL</td>
                                <td className="py-2">Yes</td>
                                <td className="py-2">Solana RPC endpoint (devnet or mainnet)</td>
                              </tr>
                              <tr className="border-b border-gray-800">
                                <td className="py-2 font-mono text-green-400">RECEIVER_PUBKEY</td>
                                <td className="py-2">Yes</td>
                                <td className="py-2">Public key of payment receiver</td>
                              </tr>
                              <tr className="border-b border-gray-800">
                                <td className="py-2 font-mono text-green-400">PRICE_LAMPORTS</td>
                                <td className="py-2">No</td>
                                <td className="py-2">Price per request in lamports (default: 5000)</td>
                              </tr>
                              <tr className="border-b border-gray-800">
                                <td className="py-2 font-mono text-green-400">X402_HEADER</td>
                                <td className="py-2">No</td>
                                <td className="py-2">Header name for payment (default: X-Payment)</td>
                              </tr>
                              <tr className="border-b border-gray-800">
                                <td className="py-2 font-mono text-green-400">PORT</td>
                                <td className="py-2">No</td>
                                <td className="py-2">Server port (default: 3000)</td>
                              </tr>
                              <tr className="border-b border-gray-800">
                                <td className="py-2 font-mono text-green-400">STORE_DRIVER</td>
                                <td className="py-2">No</td>
                                <td className="py-2">Storage driver: file or memory (default: file)</td>
                              </tr>
                              <tr className="border-b border-gray-800">
                                <td className="py-2 font-mono text-green-400">STORE_FILE</td>
                                <td className="py-2">No</td>
                                <td className="py-2">Store file path (default: ./data/store.json)</td>
                              </tr>
                              <tr className="border-b border-gray-800">
                                <td className="py-2 font-mono text-green-400">RATE_LIMIT_MAX_REQUESTS</td>
                                <td className="py-2">No</td>
                                <td className="py-2">Max requests per window (default: 100)</td>
                              </tr>
                              <tr className="border-b border-gray-800">
                                <td className="py-2 font-mono text-green-400">RATE_LIMIT_WINDOW_MS</td>
                                <td className="py-2">No</td>
                                <td className="py-2">Rate limit window in ms (default: 60000)</td>
                              </tr>
                              <tr>
                                <td className="py-2 font-mono text-green-400">OPENAI_API_KEY</td>
                                <td className="py-2">No</td>
                                <td className="py-2">OpenAI API key for AI summarize endpoint</td>
                              </tr>
                              <tr>
                                <td className="py-2 font-mono text-green-400">OPENWEATHER_API_KEY</td>
                                <td className="py-2">No</td>
                                <td className="py-2">OpenWeather API key for weather endpoint</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-3">Agent Configuration (packages/agent/.env)</h3>
                        <div className="bg-black/50 rounded-lg p-4 border border-gray-700">
                          <table className="w-full text-sm text-gray-300">
                            <thead>
                              <tr className="border-b border-gray-700">
                                <th className="text-left py-2 text-purple-400">Variable</th>
                                <th className="text-left py-2 text-purple-400">Required</th>
                                <th className="text-left py-2 text-purple-400">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-gray-800">
                                <td className="py-2 font-mono text-green-400">RPC_URL</td>
                                <td className="py-2">No</td>
                                <td className="py-2">Solana RPC endpoint (default: devnet)</td>
                              </tr>
                              <tr className="border-b border-gray-800">
                                <td className="py-2 font-mono text-green-400">X402_HEADER</td>
                                <td className="py-2">No</td>
                                <td className="py-2">Header name (default: X-Payment)</td>
                              </tr>
                              <tr className="border-b border-gray-800">
                                <td className="py-2 font-mono text-green-400">AGENT_MAX_LAMPORTS_PER_TASK</td>
                                <td className="py-2">No</td>
                                <td className="py-2">Max budget per task (default: 500000)</td>
                              </tr>
                              <tr className="border-b border-gray-800">
                                <td className="py-2 font-mono text-green-400">AGENT_WHITELIST_HOSTS</td>
                                <td className="py-2">No</td>
                                <td className="py-2">Comma-separated whitelist (default: localhost:3000)</td>
                              </tr>
                              <tr className="border-b border-gray-800">
                                <td className="py-2 font-mono text-green-400">USE_LOCAL_LLM</td>
                                <td className="py-2">No</td>
                                <td className="py-2">Use local LLM instead of OpenAI (default: false)</td>
                              </tr>
                              <tr className="border-b border-gray-800">
                                <td className="py-2 font-mono text-green-400">LLM_LOCAL_URL</td>
                                <td className="py-2">No</td>
                                <td className="py-2">Local LLM URL (default: http://127.0.0.1:1234)</td>
                              </tr>
                              <tr>
                                <td className="py-2 font-mono text-green-400">AGENT_MODEL</td>
                                <td className="py-2">No</td>
                                <td className="py-2">LLM model name (default: gpt-4o-mini)</td>
                              </tr>
                              <tr>
                                <td className="py-2 font-mono text-green-400">OPENAI_API_KEY</td>
                                <td className="py-2">No</td>
                                <td className="py-2">OpenAI API key for LLM justification</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Security */}
              {activeSection === 'security' && (
                <section className="space-y-6 animate-fade-in">
                  <div className="glass rounded-2xl border border-gray-800 p-8">
                    <h2 className="text-3xl font-semibold text-purple-400 mb-4">Security Features</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-black/50 rounded-lg p-4 border border-gray-700">
                        <h3 className="text-lg font-semibold text-green-400 mb-2">On-Chain Verification</h3>
                        <ul className="space-y-1 text-gray-300 text-sm">
                          <li>• Receiver validation</li>
                          <li>• Amount exact match</li>
                          <li>• Memo/reference verification</li>
                          <li>• Transaction finality check</li>
                        </ul>
                      </div>
                      <div className="bg-black/50 rounded-lg p-4 border border-gray-700">
                        <h3 className="text-lg font-semibold text-green-400 mb-2">Protection Mechanisms</h3>
                        <ul className="space-y-1 text-gray-300 text-sm">
                          <li>• Idempotence (reference once)</li>
                          <li>• Anti-replay (txSig once)</li>
                          <li>• Rate limiting</li>
                          <li>• Reference expiration</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="glass rounded-2xl border border-gray-800 p-8">
                    <h2 className="text-3xl font-semibold text-purple-400 mb-4">Best Practices</h2>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-3">
                        <span className="text-green-400 mt-1">✓</span>
                        <span><strong>Never commit keypairs:</strong> Use .env files and .gitignore</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-400 mt-1">✓</span>
                        <span><strong>Use separate wallets:</strong> Different receiver for devnet/mainnet</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-400 mt-1">✓</span>
                        <span><strong>Set budget limits:</strong> Configure AGENT_MAX_LAMPORTS_PER_TASK</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-400 mt-1">✓</span>
                        <span><strong>Whitelist hosts:</strong> Only allow trusted API endpoints</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-green-400 mt-1">✓</span>
                        <span><strong>Monitor transactions:</strong> Check receiver wallet regularly</span>
                      </li>
                    </ul>
                  </div>
                </section>
              )}

              {/* Development */}
              {activeSection === 'development' && (
                <section className="space-y-6 animate-fade-in">
                  <div className="glass rounded-2xl border border-gray-800 p-8">
                    <h2 className="text-3xl font-semibold text-purple-400 mb-4">Development Commands</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-2">Start Development</h3>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`# Start server and web interface
pnpm dev

# Or separately
pnpm server:dev  # Server on :3000
pnpm web:dev     # Web on :3001`}
                        </pre>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-2">Build</h3>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`pnpm build`}
                        </pre>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-2">Tests</h3>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`# Unit tests
pnpm test

# E2E tests (requires server running)
pnpm e2e

# Usage test
pnpm test:usage`}
                        </pre>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-2">Linting</h3>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`pnpm lint
pnpm format:check`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Deployment */}
              {activeSection === 'deployment' && (
                <section className="space-y-6 animate-fade-in">
                  <div className="glass rounded-2xl border border-gray-800 p-8">
                    <h2 className="text-3xl font-semibold text-purple-400 mb-4">Docker Deployment</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-2">Build and Run</h3>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`docker-compose build
docker-compose up -d`}
                        </pre>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-400 mb-2">Environment Variables</h3>
                        <p className="text-gray-300 mb-2">Set in docker-compose.yml or .env file:</p>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`RPC_URL=https://api.devnet.solana.com
RECEIVER_PUBKEY=HfJGGs4xrRHcujrUJBWZnvBBzfCgKUBSacEdSy6kgMq8
PRICE_LAMPORTS=5000`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Troubleshooting */}
              {activeSection === 'troubleshooting' && (
                <section className="space-y-6 animate-fade-in">
                  <div className="glass rounded-2xl border border-gray-800 p-8">
                    <h2 className="text-3xl font-semibold text-purple-400 mb-4">Common Issues</h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-yellow-400 mb-2">Transaction simulation failed: insufficient funds for rent</h3>
                        <p className="text-gray-300 mb-2">
                          This happens when sending payment to a new Solana address. The system automatically adds rent exemption.
                        </p>
                        <p className="text-gray-400 text-sm">Solution: Already handled automatically in the code.</p>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-yellow-400 mb-2">Agent wallet has insufficient balance</h3>
                        <p className="text-gray-300 mb-2">Request a devnet airdrop:</p>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`pnpm agent:airdrop 0.1`}
                        </pre>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-yellow-400 mb-2">Rate limit errors from CoinGecko</h3>
                        <p className="text-gray-300 mb-2">The system automatically falls back to mock data if rate limited.</p>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-yellow-400 mb-2">Port already in use</h3>
                        <p className="text-gray-300 mb-2">Kill existing processes:</p>
                        <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-gray-700">
{`lsof -ti:3000,3001 | xargs kill -9`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Mobile Navigation */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 p-4 z-50">
                <select
                  value={activeSection}
                  onChange={(e) => setActiveSection(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
