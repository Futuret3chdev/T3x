import Link from 'next/link';
import { softwareMenu } from '@/lib/software-menu';

export default function SoftwarePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <Link href="/" className="text-sm opacity-70 hover:opacity-100">← Home</Link>
      <div className="uppercase text-xs tracking-[3px] text-emerald-400 mt-4 mb-2">Software</div>
      <h1 className="text-4xl sm:text-5xl font-semibold tracking-[-1.6px] mb-4">
        Software we build ourselves.
      </h1>
      <p className="opacity-70 max-w-2xl mb-10 text-sm sm:text-base">
        Studios, developers, and security sit first. Everything else is grouped under More tools.
      </p>
      <div className="grid gap-8">
        {softwareMenu.map((group) => (
          <section key={group.title} id={group.title === 'More tools' ? 'more' : undefined}>
            <h2 className="text-2xl font-semibold">{group.title}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener' : undefined}
                  className="rounded-2xl border border-white/10 p-4 hover:bg-white/[0.03]"
                  style={{ background: 'var(--card)' }}
                >
                  <div className="font-semibold">{link.label}</div>
                  <div className="mt-2 text-sm text-emerald-400">{link.external ? 'Open ↗' : 'Open →'}</div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
