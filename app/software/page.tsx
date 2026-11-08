import Link from 'next/link';

const sections = [
  {
    href: '/software/studios',
    title: 'Studios',
    desc: 'T3x Android Studio, Device Lab, Publisher, iOS, assets, bots — our IDEs, not Google’s.',
  },
  {
    href: '/software/games',
    title: 'Games',
    desc: 'T3x Android Studio downloads, SDK, skin lab, score book, party codes.',
  },
  {
    href: '/studio',
    title: 'Game Studio',
    desc: 'Login, catalog, $T3X checkout and inventory for your titles.',
  },
  {
    href: '/chat',
    title: 'Crypto chat',
    desc: 'Trades, general and support rooms. Sign in with your portal account.',
  },
  {
    href: '/software/developers',
    title: 'Developers',
    desc: 'Free license to build on the ecosystem. Paid Pro upgrade coming soon.',
  },
  {
    href: '/software/security',
    title: 'Security',
    desc: 'Shield, vault, seed, net, keys, plus Phish Scan, Clip Guard, Sign Desk, Allow List.',
  },
];

const tools = [
  { name: 'Lumina Studio', href: 'https://ft-lumina-studio.vercel.app/', note: 'Studio' },
  { name: 'Telegram software', href: 'https://mt-radio.vercel.app/', note: 'Radio and bots' },
  { name: 'Ledger', href: 'https://ledger.vercel.app/', note: 'Accounting' },
  { name: 'Social Connect', href: 'https://ultimate-connect.vercel.app/', note: 'Social' },
  { name: 'Launch Desk', href: 'https://hewig-launch-desk.vercel.app/', note: 'Penetration testing' },
  { name: 'Wirewatch', href: 'https://wirewatch-lime.vercel.app/', note: 'Security' },
  { name: 'Fieldline', href: 'https://fieldline.vercel.app/', note: 'Security' },
  { name: 'Fieldline Sweep', href: 'https://fieldline-sweep.vercel.app/', note: 'Security' },
  { name: 'Bay Three', href: 'https://bay-three-ih5jse4a0-futuret3ch.vercel.app/', note: 'Driving' },
  { name: 'FareSense Driver', href: 'https://faresense-driver.vercel.app/', note: 'Driving' },
  { name: 'FareSense', href: 'https://faresense-app.vercel.app/', note: 'Driving' },
  { name: 'Uber, Dasher, Panda', href: 'https://driver-uber-green.vercel.app/', note: 'Driving' },
  { name: 'Futuret3ch', href: 'https://futuret3ch-next.vercel.app/', note: 'The front door' },
  { name: 'T3x Link', href: 'https://t3x-link.vercel.app/', note: 'Starlink' },
];

export default function SoftwarePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <Link href="/" className="text-sm opacity-70 hover:opacity-100">← Home</Link>
      <div className="uppercase text-xs tracking-[3px] text-emerald-400 mt-4 mb-2">Software</div>
      <h1 className="text-4xl sm:text-5xl font-semibold tracking-[-1.6px] mb-4">
        Software we build ourselves.
      </h1>
      <p className="opacity-70 max-w-2xl mb-10 text-sm sm:text-base">
        Games, developer licenses, and security tools for the T3x-ECO SYSTEM.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-2xl p-6 border border-white/10 hover:bg-white/[0.03] transition"
            style={{ background: 'var(--card)' }}
          >
            <h2 className="font-semibold text-xl mb-2">{s.title}</h2>
            <p className="text-sm opacity-70">{s.desc}</p>
            <div className="mt-4 text-sm text-emerald-400">Open →</div>
          </Link>
        ))}
      </div>
      <h2 className="mt-14 text-2xl font-semibold">More tools</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <a key={tool.href} href={tool.href} target="_blank" rel="noopener" className="rounded-2xl border border-white/10 p-4 hover:bg-white/[0.03]" style={{ background: 'var(--card)' }}>
            <div className="text-[11px] uppercase tracking-[2px] text-emerald-400">{tool.note}</div>
            <div className="mt-1 font-semibold">{tool.name}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
