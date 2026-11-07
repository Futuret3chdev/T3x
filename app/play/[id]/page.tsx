import { notFound, redirect } from 'next/navigation';
import { CATALOG, familyGames, getGame } from '@/lib/mt-catalog';
import MobilePlayShell from '@/components/games/MobilePlayShell';

export function generateStaticParams() {
  return CATALOG.map((g) => ({ id: g.id }));
}

export default async function PlayGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = getGame(id);
  if (id === 'in-ai' || g?.id === 'in-ai') redirect('/in-ai');
  if (!g || g.status === 'soon') notFound();
  return <MobilePlayShell game={g} games={familyGames()} src={g.play} />;
}
