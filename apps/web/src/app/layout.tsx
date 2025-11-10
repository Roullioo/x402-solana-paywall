import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'x402 Solana Paywall - HTTP 402 Payment Protocol',
  description: 'Autonomous AI agent for Solana micropayments. HTTP 402 Payment Required protocol on Solana Devnet.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black">{children}</body>
    </html>
  );
}

