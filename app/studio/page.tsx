import Link from 'next/link';

const STEPS = [
  { n: '1', title: 'Name it', body: 'Give the game a name and one sentence about it.' },
  { n: '2', title: 'Paint the level', body: 'Pick a block, draw the ground, then drop a start, coins, and an exit.' },
  { n: '3', title: 'Press Play', body: 'Walk it yourself. If it feels right, save it and share the link.' },
];

export default function StudioLandingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/" className="text-sm opacity-70 hover:opacity-100">← Home</Link>
      <p className="mt-8 text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase">T3x Studio</p>
      <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">Make a small game. Share it.</h1>
      <p className="mt-4 text-base text-pretty opacity-70">
        One screen. You draw the level, play it, and get a link. Players pay with $T3X from their own wallet. Futuret3ch never holds the keys.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/studio/maker" className="inline-flex h-12 items-center justify-center rounded-2xl bg-emerald-400 px-6 text-sm font-semibold text-black">
          Make a game
        </Link>
        <Link href="/studio/demo" className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/20 px-6 text-sm font-semibold">
          Try a sample
        </Link>
      </div>
      <ol className="mt-10 grid gap-3">
        {STEPS.map((step) => (
          <li key={step.n} className="flex gap-4 rounded-2xl border border-white/10 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-sm font-semibold text-black">{step.n}</span>
            <span>
              <span className="block font-semibold">{step.title}</span>
              <span className="mt-1 block text-sm opacity-70">{step.body}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
