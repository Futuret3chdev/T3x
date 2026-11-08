export type SoftLink = { label: string; href: string; external?: boolean };
export type SoftGroup = { title: string; links: SoftLink[] };

export const softwareMenu: SoftGroup[] = [
  {
    title: 'Studios',
    links: [
      { label: 'T3x Studios', href: '/software/studios' },
      { label: 'Game Studio', href: '/studio' },
      { label: 'Lumina Studio', href: 'https://ft-lumina-studio.vercel.app/', external: true },
      { label: 'Games', href: '/software/games' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Developer license', href: '/software/developers' },
      { label: 'Social Connect', href: 'https://ultimate-connect.vercel.app/', external: true },
      { label: 'Futuret3ch', href: 'https://futuret3ch-next.vercel.app/', external: true },
    ],
  },
  {
    title: 'Security',
    links: [
      { label: 'Security desk', href: '/software/security' },
      { label: 'Launch Desk', href: 'https://hewig-launch-desk.vercel.app/', external: true },
      { label: 'Wirewatch', href: 'https://wirewatch-lime.vercel.app/', external: true },
      { label: 'Fieldline', href: 'https://fieldline.vercel.app/', external: true },
      { label: 'Fieldline Sweep', href: 'https://fieldline-sweep.vercel.app/', external: true },
    ],
  },
  {
    title: 'More tools',
    links: [
      { label: 'Crypto chat', href: '/chat' },
      { label: 'Ledger', href: 'https://ledger.vercel.app/', external: true },
      { label: 'Telegram software', href: 'https://mt-radio.vercel.app/', external: true },
      { label: 'T3x Link', href: 'https://t3x-link.vercel.app/', external: true },
    ],
  },
  {
    title: 'Driving',
    links: [
      { label: 'FareSense', href: 'https://faresense-app.vercel.app/', external: true },
      { label: 'Bay Three', href: 'https://bay-three-futuret3ch.vercel.app/', external: true },
      { label: 'Uber, Dasher, Panda', href: 'https://driver-uber-green.vercel.app/', external: true },
    ],
  },
];
