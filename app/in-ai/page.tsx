import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'In-Ai · T3x',
  description: 'In-Ai is the Futuret3ch assistant, inside the T3x portal.',
};

const APP = 'https://in-ai-futuret3ch.vercel.app';

export default function InAiPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase">Futuret3ch</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">In-Ai</h1>
      <p className="mt-2 max-w-xl text-sm opacity-70">One assistant, inside the portal. Sign in with the same portal account.</p>
      <iframe
        title="In-Ai"
        src={`${APP}/chat`}
        className="mt-6 h-[720px] w-full rounded-2xl border border-white/10 bg-black"
      />
      <a href={APP} className="mt-4 inline-flex text-sm text-emerald-400 hover:underline">
        Open In-Ai in its own tab
      </a>
    </div>
  );
}
