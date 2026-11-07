export type ProductTab = {
  id: string;
  label: string;
  href: string;
  blurb: string;
};

/** Growth products we actually ship — nav API stays /developers. */
export const PRODUCT_TABS: ProductTab[] = [
  {
    id: 'shield',
    label: 'Shield',
    href: '/shield',
    blurb: 'Live grid and live tracking. Personal + Business. Help guides.',
  },
  {
    id: 'developers',
    label: 'Developers',
    href: '/developers',
    blurb: 'Market, TAP (trips, packages, food), TAPSHOP, TAPMATCH. The site API — not replaced.',
  },
  {
    id: 'stats',
    label: 'Stats',
    href: '/status',
    blurb: 'Live ecosystem health and $T3X status.',
  },
  {
    id: 'tap',
    label: 'TAP',
    href: '/#tap',
    blurb: 'TAP (trips, packages, food), TAPSHOP, TAPMATCH. TAP desk is in the portal.',
  },
  {
    id: 'bot',
    label: 'Bot',
    href: '/bot',
    blurb: 'Telegram, verification, TagMe, message bots.',
  },
  {
    id: 'games',
    label: 'Games',
    href: '/catalog',
    blurb: 'Catalog: Castrum, Dominion, Corgonaut, In-Ai, Soccer Pro, more.',
  },
  {
    id: 'scanner',
    label: 'Scanner',
    href: '/scanner',
    blurb: 'T3X Scanner, inside the portal.',
  },
  {
    id: 'in-ai',
    label: 'In-Ai',
    href: '/in-ai',
    blurb: 'In-Ai, by Futuret3ch. One assistant, inside the portal.',
  },
  {
    id: 'wallet',
    label: 'T3x Vault',
    href: 'https://t3x-wallet.vercel.app/',
    blurb: 'T3x Vault. Keys stay on the device.',
  },
  {
    id: 'studio',
    label: 'Studio',
    href: '/studio',
    blurb: 'Make and publish mini-games.',
  },
  {
    id: 'software',
    label: 'Software',
    href: '/software',
    blurb: 'Security and game software in the browser.',
  },
  {
    id: 'chat',
    label: 'Chat',
    href: '/chat',
    blurb: 'T3x Chat. Same login as portal.',
  },
];

export function tabFromPath(pathname: string): string {
  if (pathname.startsWith('/shield')) return 'shield';
  if (pathname.startsWith('/developers')) return 'developers';
  if (pathname.startsWith('/status')) return 'stats';
  if (pathname.startsWith('/portal/tap') || pathname.startsWith('/portal/tapshop') || pathname.startsWith('/portal/tapmatch')) return 'tap';
  if (pathname.startsWith('/tap') || pathname.startsWith('/catalog')) return pathname.startsWith('/tap') ? 'tap' : 'games';
  if (pathname.startsWith('/bot')) return 'bot';
  if (pathname.startsWith('/scanner')) return 'scanner';
  if (pathname.startsWith('/in-ai')) return 'in-ai';
  if (pathname.startsWith('/studio')) return 'studio';
  if (pathname.startsWith('/software')) return 'software';
  if (pathname.startsWith('/chat')) return 'chat';
  return '';
}
