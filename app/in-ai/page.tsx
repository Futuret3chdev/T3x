import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'In-Ai · T3x',
  description: 'In-Ai is the Futuret3ch assistant, inside the T3x portal.',
};

const APP = 'https://adept-learning-agent.vercel.app';

export default function InAiPage() {
  return (
    <div className="flex h-[calc(100dvh-4.25rem)] flex-col md:mx-auto md:h-auto md:max-w-6xl md:px-6 md:py-8">
      <div className="hidden md:block">
        <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase">Futuret3ch</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">In-Ai</h1>
        <p className="mt-2 max-w-xl text-sm opacity-70">One assistant, inside the portal. Sign in with the same portal account.</p>
      </div>
      <iframe
        title="In-Ai"
        src={`${APP}/chat`}
        className="min-h-0 w-full flex-1 border-0 bg-black md:mt-6 md:h-[720px] md:flex-none md:rounded-2xl md:border md:border-white/10"
      />
      <a href={APP} className="shrink-0 px-4 py-2 text-sm text-emerald-400 hover:underline md:px-0">
        Open In-Ai in its own tab
      </a>
    </div>
  );
}
