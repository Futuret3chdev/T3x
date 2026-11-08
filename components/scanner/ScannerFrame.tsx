'use client';

import { useEffect, useRef, useState } from 'react';

const BASE = 'https://t3xsolscanner.vercel.app';

export function scanUrl(raw: string): { url: string; error?: string } {
  const value = raw.trim();
  if (!value) return { url: BASE, error: 'Paste a wallet, hash, or block number.' };
  if (/^\d{1,12}$/.test(value)) return { url: `${BASE}/block/${Number(value)}` };
  if (/^0x[0-9a-fA-F]{64}$/.test(value)) return { url: `${BASE}/c/ethereum/tx/${value}` };
  if (/^0x[0-9a-fA-F]{40}$/.test(value)) return { url: `${BASE}/c/ethereum/address/${value}` };
  if (value.length >= 80) return { url: `${BASE}/tx/${encodeURIComponent(value)}` };
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value)) return { url: `${BASE}/address/${value}` };
  return { url: BASE, error: 'That is not a Solana address, an 0x address, a hash, or a block.' };
}

export default function ScannerFrame({ tall = false }: { tall?: boolean }) {
  const [query, setQuery] = useState('');
  const [src, setSrc] = useState(BASE);
  const [error, setError] = useState('');
  const frame = useRef<HTMLIFrameElement>(null);
  const portal = useRef<{ username: string; email: string } | null>(null);

  function tellScanner() {
    const user = portal.current;
    frame.current?.contentWindow?.postMessage(
      user ? { type: 't3x-portal-user', username: user.username, email: user.email } : { type: 't3x-portal-user' },
      BASE,
    );
  }

  useEffect(() => {
    fetch('/api/portal/me', { credentials: 'include' })
      .then((response) => response.json())
      .then((body: { user?: { username?: string; email?: string } }) => {
        if (body.user?.username) {
          portal.current = { username: body.user.username, email: body.user.email || '' };
          tellScanner();
        }
      })
      .catch(() => undefined);
    function onMessage(event: MessageEvent) {
      if (event.origin !== BASE) return;
      if (event.data?.type === 't3x-scanner-ready') tellScanner();
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next = scanUrl(query);
    if (next.error) {
      setError(next.error);
      return;
    }
    setError('');
    setSrc(next.url);
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (error) setError('');
          }}
          placeholder="Wallet, mint, 0x address, hash, or block"
          spellCheck={false}
          autoComplete="off"
          enterKeyHint="search"
          className="h-11 min-w-0 flex-1 rounded-xl border border-white/15 bg-[var(--card)] px-3 font-mono text-sm text-[var(--foreground)] outline-none focus:border-emerald-400"
        />
        <button type="submit" className="h-11 shrink-0 rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-black">
          Scan
        </button>
      </form>
      {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
      <iframe
        ref={frame}
        key={src}
        title="T3X Scanner"
        src={src}
        onLoad={tellScanner}
        className={`mt-3 w-full rounded-xl border border-white/10 bg-black ${tall ? 'h-[78dvh] min-h-[640px]' : 'h-[70dvh] min-h-[480px]'}`}
      />
      <a href={src} target="_blank" rel="noopener" className="mt-2 inline-flex text-sm text-emerald-400 hover:underline">
        Open this scan in its own tab
      </a>
    </div>
  );
}