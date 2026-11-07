import ScannerFrame from '@/components/scanner/ScannerFrame';

export const metadata: Metadata = {
  title: 'Scanner · T3x',
  description: 'T3X Scanner, inside the portal.',
};

export default function ScannerPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Futuret3ch</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">T3X Scanner</h1>
      <p className="mt-2 max-w-xl text-sm opacity-70">Paste an address and scan. Solana wallets open on Solana. 0x addresses open on Ethereum.</p>
      <div className="mt-4">
        <ScannerFrame tall />
      </div>
    </div>
  );
}