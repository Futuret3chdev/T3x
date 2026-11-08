export default function TagBoard() {
  return (
    <section id="tags" className="overflow-hidden rounded-2xl border border-white/10 bg-black">
      <div className="border-b border-white/10 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Futuret3ch</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Tag board</h2>
        <p className="mt-1 max-w-2xl text-sm opacity-70">
          Sign in with X and tag the live tags. Each tag counts once. The same tag is not counted again.
          Top 100 get a prize and T3X. 1st gets $200, 2nd $50, 3rd $10.
        </p>
      </div>
      <iframe title="T3X tag board" src="https://t3x-airdrop.vercel.app/" className="h-[70dvh] min-h-[520px] w-full bg-black" />
    </section>
  );
}
