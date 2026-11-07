'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 2200);
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email).then(() => {
      showToast(`Copied ${email}`);
    }).catch(() => showToast(email));
  };

  return (
    <main className="min-h-screen">
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-end text-sm">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/" className="opacity-70 hover:opacity-100">Back to Home</Link>
            <a href="https://t3x-wallet.vercel.app/" target="_blank" className="font-medium px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl border border-white/30 hover:bg-white/5 text-xs sm:text-sm">Open T3x Wallet</a>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="uppercase text-xs tracking-[3px] text-emerald-400 mb-2">FUTURET3CH</div>
        <h1 className="text-5xl font-semibold tracking-tight mb-4">Talk to In-Ai</h1>
        <p className="opacity-70 mb-10">One assistant for T3X. It also lives on this site.</p>

        <a href="/in-ai" className="mb-4 flex h-14 items-center justify-center rounded-2xl bg-emerald-400 text-sm font-semibold text-black">
          Open In-Ai
        </a>

        <div className="space-y-4 mb-10">
          {['Support@Futuret3ch.com', 'Michael@Futuret3ch.com'].map((e, i) => (
            <div key={i} className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.015] px-6 py-4">
              <div className="font-mono">{e}</div>
              <button
                onClick={() => copyEmail(e)}
                className="text-xs px-4 py-2 rounded-2xl border border-white/20 hover:bg-white/5 active:bg-white/10"
              >
                COPY
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-xs opacity-50">
          All core infrastructure is self-hosted.
        </div>
      </div>

      {message && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-400 text-black px-6 py-2 rounded-2xl text-sm font-medium shadow-xl z-50">
          {message}
        </div>
      )}

      <div className="border-t border-white/10 py-8 text-center text-[10px] opacity-40">
        <Link href="/" className="hover:text-white">← Back to T3x</Link>
      </div>
    </main>
  );
}
