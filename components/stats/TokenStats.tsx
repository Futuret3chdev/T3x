'use client';

import { useEffect, useState } from 'react';

type Chain = {
  id: string;
  name: string;
  symbol: string;
  gecko: string | null;
  address: string;
  addressLabel: string;
};

const CHAINS: Chain[] = [
  { id: 'solana', name: 'Solana', symbol: 'SOL', gecko: 'solana', address: 'So11111111111111111111111111111111111111112', addressLabel: 'Wrapped SOL' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', gecko: 'ethereum', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', addressLabel: 'Wrapped ETH' },
  { id: 'base', name: 'Base', symbol: 'ETH', gecko: 'ethereum', address: '0x4200000000000000000000000000000000000006', addressLabel: 'Wrapped ETH' },
  { id: 'bnb', name: 'BNB Chain', symbol: 'BNB', gecko: 'binancecoin', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', addressLabel: 'Wrapped BNB' },
  { id: 'polygon', name: 'Polygon', symbol: 'POL', gecko: 'polygon-ecosystem-token', address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', addressLabel: 'Wrapped POL' },
  { id: 'arbitrum', name: 'Arbitrum', symbol: 'ETH', gecko: 'ethereum', address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', addressLabel: 'Wrapped ETH' },
  { id: 'optimism', name: 'Optimism', symbol: 'ETH', gecko: 'ethereum', address: '0x4200000000000000000000000000000000000006', addressLabel: 'Wrapped ETH' },
  { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', gecko: 'avalanche-2', address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', addressLabel: 'Wrapped AVAX' },
  { id: 'gnosis', name: 'Gnosis', symbol: 'xDAI', gecko: 'xdai', address: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', addressLabel: 'Wrapped xDAI' },
  { id: 'scroll', name: 'Scroll', symbol: 'ETH', gecko: 'ethereum', address: '0x5300000000000000000000000000000000000004', addressLabel: 'Wrapped ETH' },
  { id: 'linea', name: 'Linea', symbol: 'ETH', gecko: 'ethereum', address: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f', addressLabel: 'Wrapped ETH' },
  { id: 'zksync', name: 'zkSync', symbol: 'ETH', gecko: 'ethereum', address: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91', addressLabel: 'Wrapped ETH' },
  { id: 'mantle', name: 'Mantle', symbol: 'MNT', gecko: 'mantle', address: '0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8', addressLabel: 'Wrapped MNT' },
  { id: 'celo', name: 'Celo', symbol: 'CELO', gecko: 'celo', address: '0x471EcE3750Da237f93B8E339c536989b8978a438', addressLabel: 'CELO' },
  { id: 'opbnb', name: 'opBNB', symbol: 'BNB', gecko: 'binancecoin', address: '0x4200000000000000000000000000000000000006', addressLabel: 'Wrapped BNB' },
  { id: 'unichain', name: 'Unichain', symbol: 'ETH', gecko: 'ethereum', address: '0x4200000000000000000000000000000000000006', addressLabel: 'Wrapped ETH' },
  { id: 'sonic', name: 'Sonic', symbol: 'S', gecko: 'sonic-3', address: '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38', addressLabel: 'Wrapped S' },
  { id: 'berachain', name: 'Berachain', symbol: 'BERA', gecko: 'berachain-bera', address: '0x6969696969696969696969696969696969696969', addressLabel: 'Wrapped BERA' },
  { id: 'worldchain', name: 'World Chain', symbol: 'ETH', gecko: 'ethereum', address: '0x4200000000000000000000000000000000000006', addressLabel: 'Wrapped ETH' },
  { id: 'taiko', name: 'Taiko', symbol: 'ETH', gecko: 'ethereum', address: '0xA51894664A773981C6C112C43ce576f315d5b1B6', addressLabel: 'Wrapped ETH' },
  { id: 'mode', name: 'Mode', symbol: 'ETH', gecko: 'ethereum', address: '0x4200000000000000000000000000000000000006', addressLabel: 'Wrapped ETH' },
  { id: 'fraxtal', name: 'Fraxtal', symbol: 'frxETH', gecko: 'frax-ether', address: 'Chain 252', addressLabel: 'Network' },
  { id: 'sei', name: 'Sei', symbol: 'SEI', gecko: 'sei-network', address: 'Chain 1329', addressLabel: 'Network' },
  { id: 'ink', name: 'Ink', symbol: 'ETH', gecko: 'ethereum', address: '0x4200000000000000000000000000000000000006', addressLabel: 'Wrapped ETH' },
  { id: 'cronos', name: 'Cronos', symbol: 'CRO', gecko: 'crypto-com-chain', address: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23', addressLabel: 'Wrapped CRO' },
];

type Quote = { usd?: number; usd_24h_change?: number };

export default function TokenStats() {
  const [active, setActive] = useState(CHAINS[0].id);
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [copied, setCopied] = useState(false);
  const chain = CHAINS.find((item) => item.id === active) || CHAINS[0];
  const quote = chain.gecko ? quotes[chain.gecko] : undefined;

  useEffect(() => {
    const ids = [...new Set(CHAINS.map((item) => item.gecko).filter(Boolean))].join(',');
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`)
      .then((response) => response.json())
      .then((body: Record<string, Quote>) => setQuotes(body || {}))
      .catch(() => setQuotes({}));
  }, []);

  return (
    <section id="stats" className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.015] p-5 sm:p-8">
          <div className="text-xs tracking-[3px] text-emerald-400">BRIDGE CHAINS</div>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">Stats and addresses</h2>
          <p className="mt-1 text-sm opacity-60">The same chains as the scanner bridge. Pick one for its price and address.</p>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {CHAINS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                  item.id === chain.id ? 'border-emerald-400 bg-emerald-400 text-black' : 'border-white/15'
                }`}
              >
                <img
                  src={`https://t3xsolscanner.vercel.app/chains/${item.id}.png`}
                  alt=""
                  className="h-5 w-5 rounded-full object-cover"
                />
                {item.name}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-wide opacity-60">Price</div>
              <div className="mt-1 text-3xl font-semibold tabular-nums">
                {quote?.usd ? `$${quote.usd < 1 ? quote.usd.toFixed(4) : quote.usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—'}
              </div>
              <div className={`text-sm ${(quote?.usd_24h_change || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {quote?.usd_24h_change != null ? `${quote.usd_24h_change >= 0 ? '+' : ''}${quote.usd_24h_change.toFixed(2)}% 24h` : '24h —'}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-wide opacity-60">Native</div>
              <div className="mt-1 text-3xl font-semibold">{chain.symbol}</div>
              <div className="text-sm opacity-60">{chain.name}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:col-span-1">
              <div className="text-xs uppercase tracking-wide opacity-60">{chain.addressLabel}</div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(chain.address);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                }}
                className="mt-2 break-all text-left font-mono text-sm text-emerald-400"
              >
                {copied ? 'Copied' : chain.address}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
