'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/theme/ThemeToggle';
import NoticeBell from '@/components/nav/NoticeBell';
import { LINKS } from '@/lib/constants';
import { Connection, PublicKey, VersionedTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import servicesData from '@/app/status/services.json';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Navbar() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    code: '',
    company_website: '',
  });
  const [need2fa, setNeed2fa] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [portalUser, setPortalUser] = useState<{ username: string; license_key?: string | null; avatar_url?: string | null } | null>(null);

  useEffect(() => {
    fetch('/api/portal/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setPortalUser(d.user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const openSaved = () => {
      const raw = sessionStorage.getItem('t3x-auth');
      if (!raw) return;
      sessionStorage.removeItem('t3x-auth');
      try {
        const data = JSON.parse(raw) as { mode?: string; next?: string };
        if (data.next) sessionStorage.setItem('t3x-auth-next', data.next);
        openAuth(data.mode === 'register' ? 'register' : 'login');
      } catch {
        openAuth('login');
      }
    };
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ mode?: string; next?: string }>).detail || {};
      if (detail.next) sessionStorage.setItem('t3x-auth-next', detail.next);
      openAuth(detail.mode === 'register' ? 'register' : 'login');
    };
    openSaved();
    window.addEventListener('t3x-open-auth', onOpen);
    return () => window.removeEventListener('t3x-open-auth', onOpen);
  }, []);

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setFormData({ username: '', email: '', password: '', code: '', company_website: '' });
    setNeed2fa(false);
    setAuthError('');
    setAuthOpen(true);
  };

  const closeAuth = () => {
    setAuthOpen(false);
  };

  const logout = async () => {
    await fetch('/api/portal/logout', { method: 'POST', credentials: 'include' });
    setPortalUser(null);
    if (window.location.pathname.startsWith('/portal') || window.location.pathname.startsWith('/chat')) {
      window.location.href = '/';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthBusy(true);
    setAuthError('');
    try {
      const path = authMode === 'login' ? '/api/portal/login' : '/api/portal/register';
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.ok) {
        if (data.need2fa) setNeed2fa(true);
        setAuthError(data.error || 'Could not sign in.');
        return;
      }
      setPortalUser(data.user);
      closeAuth();
      const next = sessionStorage.getItem('t3x-auth-next');
      sessionStorage.removeItem('t3x-auth-next');
      const dest = next && next.startsWith('/') && !next.startsWith('/login') ? next : '/portal';
      if (window.location.pathname !== dest) window.location.href = dest;
    } catch {
      setAuthError('Network error. Try again.');
    } finally {
      setAuthBusy(false);
    }
  };

  // Buy $T3X form state (compact at top, below BUY $T3X NOW)
  const [showBuyPanel, setShowBuyPanel] = useState(false);
  const [showClaimPanel, setShowClaimPanel] = useState(false);
  const buyPanelRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mobile detection for tips
  const [isMobile, setIsMobile] = useState(false);
  const [compact, setCompact] = useState(true);
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsMobile(/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent));
    }
    const mq = window.matchMedia('(max-width: 1100px), (pointer: coarse)');
    const apply = () => setCompact(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Wallet adapter for manual connect buttons (needed for mobile deeplinks for Phantom/Solflare/Backpack)
  const { select, connect: adapterConnect } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWalletForBuy = async (walletType: 'phantom' | 'solflare' | 'backpack') => {
    setIsConnecting(true);

    try {
      const adapterName = walletType === 'phantom' ? 'Phantom' : walletType === 'solflare' ? 'Solflare' : 'Backpack';
      select(adapterName as any);
      await adapterConnect();
      // Success if we get here (provider was available)
    } catch (error: any) {
      console.error('Adapter connect failed, attempting mobile deep link fallback:', error);
      // Fallback for mobile: deep link to open the dapp in the wallet's in-app browser
      // Using ref param to help wallets recognize it as a dapp link (prevents opening wallet home/swap instead of the site)
      if (/iPhone|Android/i.test(navigator.userAgent)) {
        const currentUrl = window.location.href;
        const ref = encodeURIComponent(window.location.origin);
        let deepLink = '';
        if (walletType === 'phantom') {
          deepLink = `https://phantom.app/ul/v1/browse/${encodeURIComponent(currentUrl)}?ref=${ref}`;
        } else if (walletType === 'solflare') {
          deepLink = `https://solflare.com/ul/v1/browse/${encodeURIComponent(currentUrl)}?ref=${ref}`;
        } else if (walletType === 'backpack') {
          deepLink = `https://backpack.app/ul/browse/${encodeURIComponent(currentUrl)}?ref=${ref}`;
        }
        if (deepLink) {
          window.location.href = deepLink;
          return; // page will reload in the wallet app/browser
        }
      }
      // Fallback: open install page
      const installUrls: Record<string, string> = {
        phantom: 'https://phantom.app/',
        solflare: 'https://solflare.com/',
        backpack: 'https://backpack.app/',
      };
      window.open(installUrls[walletType], '_blank');
    } finally {
      setIsConnecting(false);
    }
  };

  // Jupiter Plugin init effect (replaces all previous custom buy logic that was erroring)
  useEffect(() => {
    if (!showBuyPanel) {
      if (typeof window !== 'undefined' && (window as any).Jupiter && typeof (window as any).Jupiter.destroy === 'function') {
        try { (window as any).Jupiter.destroy(); } catch (e) {}
      }
      return;
    }

    const initJupiterPlugin = () => {
      if (typeof window !== 'undefined' && (window as any).Jupiter) {
        try {
          if (typeof (window as any).Jupiter.destroy === 'function') (window as any).Jupiter.destroy();
        } catch (e) {}
        (window as any).Jupiter.init({
          displayMode: "integrated",
          integratedTargetId: "jupiter-buy-container",
          formProps: {
            initialInputMint: "So11111111111111111111111111111111111111112",
          },
          branding: {
            logoUri: "https://futuret3ch.com.au/assets/img/logo.png",
            name: "T3x-ECOSYSTEM",
          },
        });
      }
    };

    if (typeof window !== 'undefined') {
      if (!(window as any).Jupiter) {
        const script = document.createElement('script');
        script.src = 'https://plugin.jup.ag/plugin-v1.js';
        script.async = true;
        script.onload = initJupiterPlugin;
        document.head.appendChild(script);
      } else {
        initJupiterPlugin();
      }
    }
  }, [showBuyPanel]);

  // Close buy panel on outside click (mouse + touch for mobile). User closes with X only - no auto scroll close.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (buyPanelRef.current && !buyPanelRef.current.contains(event.target as Node)) {
        setShowBuyPanel(false);
      }
    };

    if (showBuyPanel) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as any);
    };
  }, [showBuyPanel]);

  return (
    <header className="site-header w-full border-b">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between text-sm">
        <Link href="/" className="font-semibold tracking-tight flex items-center gap-2 hover:opacity-80 transition">
          <span className="text-emerald-500">T3X</span>
          <span className="opacity-70">Futuret3ch</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
            <a href="https://x.com/futuret3chdev" target="_blank" rel="noopener" aria-label="X" title="X" className="flex h-9 w-9 items-center justify-center rounded-full border border-current/20">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true"><path d="M14.7 10.3 22.4 1.5h-2.2l-6.7 7.6L8.2 1.5H1.6l8.1 11.5L1.5 22.5h2.2l7.1-8.1 5.7 8.1h6.6l-8.4-12.2Zm-2.5 2.9-.8-1.2-6.6-9.3h2.8l5.3 7.6.8 1.2 6.9 9.8h-2.8l-5.6-8.1Z"/></svg>
            </a>
            <a href="/status" className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-current/20 px-2.5 py-1 text-xs" title="System Status">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>{servicesData.services.length}/7</span>
            </a>
            {portalUser ? (
              <>
                <NoticeBell />
                <a href="/portal" className="flex items-center gap-1 max-w-[7rem] opacity-90" title="Account">
                {portalUser.avatar_url ? (
                  <img src={portalUser.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <span className="w-7 h-7 rounded-full border border-current/20 flex items-center justify-center text-xs">👤</span>
                )}
              </a>
              </>
            ) : (
              <button type="button" onClick={() => openAuth('login')} className="text-[11px] px-2.5 py-1 border border-current/30 rounded-full">
                Log in
              </button>
            )}
            <ThemeToggle />
            <button
              onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setShowBuyPanel(false); setShowClaimPanel(false); }}
              className="flex h-9 w-9 items-center justify-center text-xl leading-none"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
        </div>
      </div>

      <div className="border-t border-current/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-3 py-2 sm:px-6">
          <button
            type="button"
            onClick={() => { setShowBuyPanel((open) => !open); setShowClaimPanel(false); setMobileMenuOpen(false); }}
            className="rounded-full border border-emerald-500/50 px-4 py-1.5 text-xs font-semibold text-emerald-500"
          >
            BUY $T3X
          </button>
          <button
            type="button"
            onClick={() => { setShowClaimPanel((open) => !open); setShowBuyPanel(false); setMobileMenuOpen(false); }}
            className="rounded-full bg-emerald-400 px-4 py-1.5 text-xs font-semibold text-black"
          >
            CLAIM $T3X
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="border-t border-current/10 px-3 py-3 sm:px-6" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {[
              ['/#tokenomics', 'Tokenomics', '◎'],
              ['/#utilities', 'Utilities', '⚡'],
              ['/#tap', 'TAP', '🚗'],
              ['/catalog', 'Games', '🎮'],
              ['/developers', 'API', '</>'],
              ['/casino', 'Casino', '🎲'],
              ['/software', 'Software', '🛠'],
              ['/studio', 'Studio', '✎'],
              ['/scanner', 'Scanner', '⌕'],
              ['/scanner#tags', 'Tags', '#'],
              ['/in-ai', 'In-Ai', '✦'],
              ['/shield', 'Shield', '🛡'],
              ['/chat', 'Chat', '💬'],
              ['/status', 'Status', '✓'],
              ['/contact', 'Contact', '✉'],
              ['/#stats', 'Live', '●'],
            ].map(([href, label, icon]) => (
              <a key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-1 rounded-xl border border-current/10 px-1 py-2 text-center">
                <span className="text-base leading-none">{icon}</span>
                <span className="text-[10px] leading-tight opacity-80">{label}</span>
              </a>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="opacity-60">T3x Vault · coming soon</span>
            {!portalUser ? (
              <button type="button" onClick={() => { setMobileMenuOpen(false); openAuth('register'); }} className="underline">Register</button>
            ) : (
              <button type="button" onClick={logout} className="underline">Log out</button>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showClaimPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="ml-auto w-full max-w-md overflow-hidden"
          >
            <div className="mr-3 rounded-b-2xl border border-current/15 px-4 py-3 text-sm shadow-xl sm:mr-6" style={{ background: 'var(--background)' }}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">Claim $T3X</p>
                <button type="button" onClick={() => setShowClaimPanel(false)} className="text-xs opacity-70">Slide up</button>
              </div>
              <p className="mt-2 text-xs opacity-70">Tags pay 1 T3X for every 2 tags. $T3X is paid once it is available, on the T3X chain.</p>
              <a href="/claims" className="mt-3 inline-flex rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-black">Open claims</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact buy form panel - shows just below BUY $T3X NOW, hides on click off.
          Manual wallet connect (Phantom/Solflare/Backpack + deeplinks) is now primary so mobile actually works.
          Jupiter widget kept as secondary / visual option. */}
      {showBuyPanel && (
        <div ref={buyPanelRef} className="ml-auto mr-3 w-full max-w-[480px] rounded-b-xl border border-current/15 shadow-2xl sm:mr-6 md:max-w-[620px]" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
          <div className="px-4 sm:px-6 py-3 sm:py-4 text-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs sm:text-sm font-medium">Buy $T3X</div>
              <button onClick={() => setShowBuyPanel(false)} className="text-xs opacity-70" aria-label="Slide buy panel up">Slide up</button>
            </div>

            {/* Manual connect buttons — only on mobile for deeplink support (Phantom/Solflare/Backpack).
                Uses polling + conditional deep link (v1 for Solflare) per wallet-adapter and your game logic.
                No clutter: no address, no Disconnect, no Quick Buy, no error messages in panel. */}
            {isMobile && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {(['phantom', 'solflare', 'backpack'] as const).map((name) => (
                    <button
                      key={name}
                      disabled={isConnecting}
                      onClick={() => connectWalletForBuy(name)}
                      className="px-3 py-1.5 text-xs rounded-2xl border border-white/20 hover:bg-white/5 active:bg-white/10 disabled:opacity-50"
                    >
                      {isConnecting ? 'Connecting...' : (name === 'phantom' ? 'Phantom' : name === 'solflare' ? 'Solflare' : 'Backpack')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop: Gateway (THE WALLET IS THE GATEWAY) on LEFT expanding to fill gap, Jupiter swap box on RIGHT.
                Mobile: stacks naturally. */}
            <div className="flex flex-col md:flex-row gap-2 md:gap-3">
              {/* Gateway block on left, flex-1 to expand and fill left/center space on desktop */}
              <div className="md:flex-1">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-2 sm:p-3 text-xs sm:text-sm h-full">
                  <div className="text-emerald-400 text-[10px] sm:text-xs tracking-[3px]">THE WALLET IS THE GATEWAY</div>
                  <div className="font-semibold tracking-tight mt-0.5 text-sm sm:text-base">T3x Vault<br />For infinite possibilities.<br />Truly ours.</div>
                  <ul className="mt-1 space-y-0.5 text-[10px] sm:text-xs opacity-80">
                    <li>• 100% self-built. No injected providers.</li>
                    <li>• Create, import, send, mint NFTs, earn &amp; spend Rockets.</li>
                    <li>• Native T3x chain + Solana $T3X + future bridges.</li>
                    <li>• Keys encrypted locally. Seed never leaves your device.</li>
                  </ul>
                  <a href={LINKS.wallet} target="_blank" className="mt-1 inline-block text-xs sm:text-sm text-emerald-400 hover:underline">OPEN T3x Vault →</a>
                </div>
              </div>

              {/* Swap box (Jupiter plugin) on right — kept as visual / advanced alternative */}
              <div className="md:w-[280px]">
                <div className="relative">
                  <div id="jupiter-buy-container" style={{ width: '100%', height: '340px', borderRadius: '12px', overflow: 'hidden', background: '#000' }} />
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl border border-white/15 bg-[#07080c] px-4 text-center">
                    <div className="text-[11px] tracking-[3px] text-emerald-400">$T3X</div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight">Coming soon</div>
                    <p className="mt-2 text-xs opacity-70">Buying opens when the token is live. The swap stays here underneath.</p>
                  </div>
                </div>
                <div className="text-[10px] opacity-50 mt-1 text-center">Buy $T3X · coming soon</div>
              </div>
            </div>

            {/* CSS vars to theme the Jupiter plugin to match the site's dark + emerald look */}
            <style>{`
              :root {
                --jupiter-plugin-primary: 199, 242, 132;
                --jupiter-plugin-background: 0, 0, 0;
                --jupiter-plugin-primary-text: 232, 249, 255;
                --jupiter-plugin-warning: 251, 191, 36;
                --jupiter-plugin-interactive: 33, 42, 54;
                --jupiter-plugin-module: 16, 23, 31;
              }
            `}</style>
          </div>
        </div>
      )}

      {/* Auth Modal / Popup — clean, good looking, hidden until icon clicked */}
      <AnimatePresence>
        {authOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={closeAuth}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="text-xl font-semibold tracking-tight">T3x Portal</div>
                <button onClick={closeAuth} className="opacity-60 hover:opacity-100 text-xl leading-none">×</button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10 mb-6">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 pb-3 text-sm font-medium ${authMode === 'login' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'opacity-70 hover:opacity-100'}`}
                >
                  Login
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 pb-3 text-sm font-medium ${authMode === 'register' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'opacity-70 hover:opacity-100'}`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {authMode === 'register' && (
                  <div>
                    <div className="text-xs opacity-60 mb-1">Username</div>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="testuser1"
                      required
                      className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400/60"
                    />
                  </div>
                )}

                <div>
                  <div className="text-xs opacity-60 mb-1">Email</div>
                  <input
                    type={authMode === 'login' ? 'text' : 'email'}
                    autoComplete={authMode === 'login' ? 'username' : 'email'}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={authMode === 'login' ? 'Email or username' : 'wallet@email.com'}
                    required
                    className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400/60"
                  />
                </div>

                <div>
                  <div className="text-xs opacity-60 mb-1">Password</div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="•••••••••••"
                    required
                    className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400/60"
                  />
                </div>
                {need2fa && (
                  <div>
                    <div className="text-xs opacity-60 mb-1">Authenticator code</div>
                    <input
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="123456"
                      className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400/60"
                    />
                  </div>
                )}
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={formData.company_website}
                  onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
                  className="hidden"
                />

                {authError && <div className="text-sm text-red-400">{authError}</div>}
                <button
                  type="submit"
                  disabled={authBusy}
                  className="mt-2 w-full py-3.5 rounded-2xl bg-white text-black font-semibold tracking-wider text-sm active:opacity-90 disabled:opacity-50"
                >
                  {authBusy ? 'PLEASE WAIT' : authMode === 'login' ? 'ENTER PORTAL' : 'CREATE ACCOUNT'}
                </button>
              </form>

              <div className="text-center text-[10px] mt-4 opacity-50">
                Same account on every Futuret3ch site. Your developer license stays on this profile.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
