'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ScannerFrame from '@/components/scanner/ScannerFrame';

const APP = 'https://adept-learning-agent.vercel.app';

type Row = { username: string; usd: number; earned: number };

export function ScannerEmbed() {
  return (
    <section id="scanner" className="border-b border-white/10 bg-black">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Futuret3ch</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">T3X Scanner</h2>
        <p className="mt-2 max-w-xl text-sm opacity-70">Paste an address and scan it here. Solana or 0x.</p>
        <div className="mt-4">
          <ScannerFrame tall />
        </div>
      </div>
    </section>
  );
}

export default function PortalExtras() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    fetch('https://t3xsolscanner.vercel.app/api/public-claims')
      .then((response) => response.json())
      .then((body: { rows?: Row[] }) => setRows(body.rows || []))
      .catch(() => setRows([]));
  }, []);

  return (
    <>
      <section id="in-ai" className="border-y border-white/10 bg-black/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase">Futuret3ch</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">In-Ai</h2>
          <p className="mt-2 max-w-xl text-sm opacity-70">The assistant lives here. The link under it opens the same app on its own.</p>
          <iframe title="In-Ai" src={`${APP}/chat`} className="mt-5 h-[70dvh] min-h-[520px] w-full rounded-2xl border border-white/10 bg-black" />
          <a href={APP} className="mt-3 inline-flex text-sm text-emerald-400 hover:underline">
            Open In-Ai in its own tab
          </a>
        </div>
      </section>
      <section id="claims" className="bg-black/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <h2 className="text-3xl font-semibold tracking-tight">Claims</h2>
          <p className="mt-2 max-w-xl text-sm opacity-70">
            Every full $20 swapped or bridged earns T3X. T3X will be paid once it becomes available. Register and sign in with the portal.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/login" className="inline-flex h-11 items-center rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-black">
              Register or sign in
            </Link>
            <Link href="/claims" className="inline-flex h-11 items-center rounded-xl border border-white/20 px-4 text-sm font-semibold">
              Open claims
            </Link>
          </div>
          <ul className="mt-5 max-h-80 divide-y divide-white/10 overflow-y-auto rounded-2xl border border-white/10">
            {!rows.length ? <li className="px-4 py-3 text-sm opacity-60">No public claims yet.</li> : null}
            {rows.map((row, index) => (
              <li key={row.username} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>
                  <span className="mr-2 font-mono text-xs opacity-50">{String(index + 1).padStart(2, "0")}</span>
                  {row.username}
                </span>
                <span className="font-mono">${Number(row.usd).toFixed(2)} · {row.earned} T3X</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
