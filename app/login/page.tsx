'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function LoginGate() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const next = params.get('next') || '';
    const mode = params.get('mode') === 'register' || params.get('mode') === 'signup' ? 'register' : 'login';
    const dest = next.startsWith('/') && !next.startsWith('/login') ? next : '';

    fetch('/api/portal/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          router.replace(dest || '/portal');
          return;
        }
        sessionStorage.setItem('t3x-auth', JSON.stringify({ mode, next: dest }));
        window.dispatchEvent(new CustomEvent('t3x-open-auth', { detail: { mode, next: dest } }));
        if (dest) router.replace(dest);
        else if (window.history.length > 1) router.back();
        else router.replace('/');
      })
      .catch(() => router.replace('/'));
  }, [params, router]);

  return <div className="px-4 py-20 text-sm opacity-60">Opening the portal sign-in…</div>;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="px-4 py-20 opacity-60">Opening the portal sign-in…</div>}>
      <LoginGate />
    </Suspense>
  );
}
