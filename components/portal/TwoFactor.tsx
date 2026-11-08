'use client';

import { useEffect, useState } from 'react';

export default function TwoFactor() {
  const [enabled, setEnabled] = useState(false);
  const [secret, setSecret] = useState('');
  const [uri, setUri] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    fetch('/api/portal/security', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setEnabled(Boolean(d.enabled)))
      .catch(() => undefined);
  }, []);

  async function start() {
    setNote('');
    const res = await fetch('/api/portal/security', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start' }),
    });
    const data = await res.json();
    if (!data.ok) {
      setNote(data.error || 'Could not start setup.');
      return;
    }
    setSecret(data.secret);
    setUri(data.uri);
  }

  async function confirm(action: 'confirm' | 'disable') {
    setNote('');
    const res = await fetch('/api/portal/security', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, code, password }),
    });
    const data = await res.json();
    if (!data.ok) {
      setNote(data.error || 'Could not update 2FA.');
      return;
    }
    setEnabled(Boolean(data.enabled));
    setSecret('');
    setUri('');
    setCode('');
    setPassword('');
    setNote(data.enabled ? 'Authenticator is on.' : 'Authenticator is off.');
  }

  return (
    <section className="rounded-2xl border border-white/10 p-4">
      <h3 className="font-semibold">Authenticator</h3>
      <p className="mt-1 text-sm opacity-70">
        {enabled
          ? 'Sign-in asks for a 6-digit code after the password.'
          : 'Turn this on. A password alone is not enough if this site is being scanned.'}
      </p>
      {secret ? (
        <div className="mt-3 space-y-2 text-sm">
          <p>Add this key in Google Authenticator, Authy, or 1Password.</p>
          <p className="break-all font-mono text-emerald-300">{secret}</p>
          {uri ? (
            <a className="text-emerald-400 underline" href={uri}>
              Open in an authenticator app
            </a>
          ) : null}
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            placeholder="6-digit code"
            className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2"
          />
          <button type="button" onClick={() => confirm('confirm')} className="rounded-xl bg-emerald-400 px-4 py-2 font-semibold text-black">
            Turn on
          </button>
        </div>
      ) : enabled ? (
        <div className="mt-3 space-y-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            placeholder="Current code"
            className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2"
          />
          <button type="button" onClick={() => confirm('disable')} className="rounded-xl border border-white/20 px-4 py-2 text-sm">
            Turn off
          </button>
        </div>
      ) : (
        <button type="button" onClick={start} className="mt-3 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-black">
          Set up authenticator
        </button>
      )}
      {note ? <p className="mt-2 text-sm text-emerald-300">{note}</p> : null}
    </section>
  );
}
