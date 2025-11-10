'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

// Get API base URL - use relative in production, absolute in development
const getApiBase = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE || window.location.origin;
  }
  return process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';
};

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'request' | 'response' | 'agent' | 'payment' | 'blockchain' | 'success' | 'error';
  message: string;
  data?: Record<string, unknown>;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  interface SolPriceResult {
    asset: string;
    usd: number;
    eur: number;
    network: string;
    timestamp: string;
    demo: boolean;
    mode?: string;
  }
  
  const [result, setResult] = useState<SolPriceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (type: LogEntry['type'], message: string, data?: Record<string, unknown>) => {
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    
    setLogs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        timestamp,
        type,
        message,
        data,
      },
    ]);
  };

  const simulateFullProcess = async () => {
    setLoading(true);
    setLogs([]);
    setResult(null);
    setError(null);

    try {
      addLog('request', 'Initiating API request...', { url: `${getApiBase()}/api/crypto?asset=SOL` });
      await new Promise(resolve => setTimeout(resolve, 500));

      addLog('response', 'Server responded with 402 Payment Required', {
        status: 402,
        amountLamports: 5000,
        receiver: 'HfJGGs4xrRHcujrUJBWZnvBBzfCgKUBSacEdSy6kgMq8',
        reference: '550e8400-e29b-41d4-a716-446655440000',
      });
      await new Promise(resolve => setTimeout(resolve, 800));

      addLog('agent', 'Agent starting task: "get SOL price"', {
        wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        target: `${getApiBase()}/api/crypto?asset=SOL`,
      });
      await new Promise(resolve => setTimeout(resolve, 600));

      addLog('agent', 'Policy loaded - Checking authorization...', {
        maxBudget: '500000 lamports',
        whitelist: getApiBase().replace(/^https?:\/\//, '').split('/')[0],
      });
      await new Promise(resolve => setTimeout(resolve, 500));

      addLog('agent', 'Payment authorized by policy', {
        reason: 'Host whitelisted, amount within budget',
      });
      await new Promise(resolve => setTimeout(resolve, 700));

      addLog('payment', 'Preparing Solana transaction...', {
        from: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        to: 'HfJGGs4xrRHcujrUJBWZnvBBzfCgKUBSacEdSy6kgMq8',
        amount: '5000 lamports (0.000005 SOL)',
        memo: '550e8400-e29b-41d4-a716-446655440000',
      });
      await new Promise(resolve => setTimeout(resolve, 1000));

      addLog('blockchain', 'Transaction sent to Solana network', {
        signature: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
        status: 'pending',
      });
      await new Promise(resolve => setTimeout(resolve, 1200));

      addLog('blockchain', 'Waiting for on-chain confirmation...', {
        commitment: 'confirmed',
      });
      await new Promise(resolve => setTimeout(resolve, 1500));

      addLog('blockchain', 'Transaction confirmed on-chain!', {
        signature: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
        status: 'finalized',
        slot: 245678901,
      });
      await new Promise(resolve => setTimeout(resolve, 600));

      addLog('request', 'Re-fetching with X-Payment header...', {
        header: 'X-Payment: eyJ0eFNpZyI6IjNKOT...',
      });
      await new Promise(resolve => setTimeout(resolve, 800));

      addLog('response', 'Server verifying payment on-chain...', {
        checking: ['receiver', 'amount', 'memo', 'idempotence'],
      });
      await new Promise(resolve => setTimeout(resolve, 1000));

      addLog('success', 'Payment verified successfully!', {
        verified: true,
        status: 200,
      });
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use relative URL to avoid CORS and localhost issues
      const apiUrl = '/api/demo/sol-price';
      addLog('request', 'Fetching final resource...', { url: apiUrl });
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      addLog('success', 'Resource retrieved successfully', {
        data: data,
      });

      setResult(data);
    } catch (err) {
      addLog('error', `Process failed: ${(err as Error).message}`);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getLogIcon = (type: LogEntry['type']) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'request':
        return (
          <svg className={`${iconClass} text-blue-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'response':
        return (
          <svg className={`${iconClass} text-yellow-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'agent':
        return (
          <svg className={`${iconClass} text-purple-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'payment':
        return (
          <svg className={`${iconClass} text-pink-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'blockchain':
        return (
          <svg className={`${iconClass} text-green-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'success':
        return (
          <svg className={`${iconClass} text-green-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className={`${iconClass} text-red-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className={`${iconClass} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'request':
        return 'text-blue-400';
      case 'response':
        return 'text-yellow-400';
      case 'agent':
        return 'text-purple-400';
      case 'payment':
        return 'text-pink-400';
      case 'blockchain':
        return 'text-green-400';
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <nav className="flex justify-between items-center mb-16 animate-fade-in">
            <div className="text-3xl font-bold text-white">
              x402
            </div>
            <div className="flex gap-6">
              <Link href="/docs" className="text-gray-400 hover:text-white transition-colors font-medium">
                Documentation
              </Link>
            </div>
          </nav>

          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-block mb-8 animate-float">
              <span className="text-9xl md:text-[12rem] font-bold text-white">
                x402
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 text-white">
              Solana Paywall Protocol
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-300 max-w-4xl mx-auto mb-6 font-light">
              Autonomous AI agent for HTTP 402 micropayments on Solana
            </p>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
              Automatic payment detection, policy-based decisions, and on-chain verification
            </p>
          </div>

          <div className="glass rounded-3xl border border-gray-800 p-10 shadow-2xl mb-16 animate-slide-in">
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Live Demo - Full Process
              </h2>
              <p className="text-gray-300 text-lg md:text-xl">
                Watch the complete flow: Request → 402 → Agent → Payment → Blockchain → Data
              </p>
            </div>

            <div className="flex justify-center mb-10">
              <button
                onClick={simulateFullProcess}
                disabled={loading}
                className="group relative bg-white text-black font-bold text-lg md:text-xl py-5 px-16 rounded-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="relative z-10 flex items-center gap-3">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Start Full Process Demo
                    </>
                  )}
                </span>
              </button>
            </div>

            {logs.length > 0 && (
              <div className="bg-black/90 border border-gray-900 rounded-2xl p-6 font-mono text-sm mb-8 max-h-96 overflow-y-auto animate-fade-in shadow-inner">
                {logs.map((log, index) => (
                  <div 
                    key={log.id} 
                    className="mb-4 flex gap-4 items-start animate-slide-in hover:bg-gray-900/30 rounded-lg p-2 -m-2 transition-colors"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <span className="text-gray-600 text-xs mt-1 min-w-[90px] font-mono">{log.timestamp}</span>
                    <div className="mt-0.5 flex-shrink-0">{getLogIcon(log.type)}</div>
                    <div className="flex-1 min-w-0">
                      <span className={getLogColor(log.type) + " font-semibold"}>
                        [{log.type.toUpperCase()}]
                      </span>
                      <span className="text-gray-200 ml-2">{log.message}</span>
                      {log.data && (
                        <div className="mt-3 ml-8 text-xs text-gray-400 animate-fade-in">
                          <pre className="whitespace-pre-wrap bg-black/70 p-3 rounded-lg border border-gray-900 overflow-x-auto">{JSON.stringify(log.data, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}

            {result && (
              <div className="glass border border-gray-800 rounded-2xl p-8 animate-fade-in shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-white rounded-full p-4 shadow-lg">
                    <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-white">Final Result</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-black/60 rounded-xl p-6 border border-gray-800 hover:border-white/30 transition-all transform hover:scale-105">
                    <div className="text-gray-500 text-sm mb-2 font-medium">Asset</div>
                    <div className="text-2xl font-bold text-white">{result.asset}</div>
                  </div>
                  <div className="bg-black/60 rounded-xl p-6 border border-gray-800 hover:border-white/30 transition-all transform hover:scale-105">
                    <div className="text-gray-500 text-sm mb-2 font-medium">Price (USD)</div>
                    <div className="text-3xl font-bold text-white">${result.usd?.toFixed(2)}</div>
                  </div>
                  <div className="bg-black/60 rounded-xl p-6 border border-gray-800 hover:border-white/30 transition-all transform hover:scale-105">
                    <div className="text-gray-500 text-sm mb-2 font-medium">Price (EUR)</div>
                    <div className="text-3xl font-bold text-white">€{result.eur?.toFixed(2)}</div>
                  </div>
                </div>
                <div className="bg-black/60 rounded-xl p-6 border border-gray-800">
                  <div className="text-gray-500 text-sm mb-3 font-medium">Raw Data</div>
                  <pre className="text-xs text-gray-300 overflow-auto font-mono">{JSON.stringify(result, null, 2) as string}</pre>
                </div>
              </div>
            )}

            {error && (
              <div className="glass border border-gray-800 rounded-2xl p-6 animate-fade-in">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 rounded-full p-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">Error</h3>
                    <p className="text-gray-300">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="glass rounded-2xl border border-gray-800 p-8 hover:border-white/30 transition-all transform hover:scale-105 animate-fade-in group">
              <div className="w-14 h-14 bg-white rounded-xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Secure</h3>
              <p className="text-gray-300 leading-relaxed">
                On-chain verification with strict validation of receiver, amount, and memo references
              </p>
            </div>

            <div className="glass rounded-2xl border border-gray-800 p-8 hover:border-white/30 transition-all transform hover:scale-105 animate-fade-in group" style={{ animationDelay: '0.1s' }}>
              <div className="w-14 h-14 bg-white rounded-xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Autonomous</h3>
              <p className="text-gray-300 leading-relaxed">
                AI agent with policy-based decisions and optional LLM justification for payments
              </p>
            </div>

            <div className="glass rounded-2xl border border-gray-800 p-8 hover:border-white/30 transition-all transform hover:scale-105 animate-fade-in group" style={{ animationDelay: '0.2s' }}>
              <div className="w-14 h-14 bg-white rounded-xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Fast</h3>
              <p className="text-gray-300 leading-relaxed">
                Micropayments on Solana with retry logic and exponential backoff
              </p>
            </div>
          </div>

          <div className="text-center animate-fade-in">
            <Link
              href="/docs"
              className="inline-block glass rounded-2xl border border-gray-800 p-10 hover:border-white/30 transition-all transform hover:scale-105 group max-w-2xl"
            >
              <h3 className="text-3xl font-semibold text-white mb-3 transition-colors">View Documentation</h3>
              <p className="text-gray-300 text-lg">
                Learn how to integrate x402 protocol into your applications
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-white group-hover:translate-x-2 transition-transform">
                <span className="font-medium">Explore Docs</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
