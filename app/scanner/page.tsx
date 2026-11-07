import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scanner · T3x',
  description: 'T3X Scanner, inside the portal.',
};

const SCANNER = 'https://t3xsolscanner.vercel.app';

export default function ScannerPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase">Futuret3ch</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">T3X Scanner</h1>
      <p className="mt-2 max-w-xl text-sm opacity-70">Scan wallets, swap, and bridge without leaving the portal.</p>
      <iframe title="T3X Scanner" src={SCANNER} className="mt-6 h-[820px] w-full rounded-2xl border border-white/10 bg-black" />
      <a href={SCANNER} className="mt-4 inline-flex text-sm text-emerald-400 hover:underline">
        Open the scanner in its own tab
      </a>
    </div>
  );
}
