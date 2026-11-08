import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mysql2'],
  // Vercel was returning MIDDLEWARE_INVOCATION_FAILED on every server route
  // because the Node lambda was missing traced @swc helpers.
  outputFileTracingIncludes: {
    '*': ['./node_modules/@swc/helpers/**'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  async rewrites() {
    const traps = [
      '/.env',
      '/.env.local',
      '/wp-login.php',
      '/wp-admin',
      '/wp-admin/:path*',
      '/phpmyadmin',
      '/phpmyadmin/:path*',
      '/administrator',
      '/xmlrpc.php',
      '/server-status',
      '/backup.sql',
      '/.git/config',
      '/config.json',
      '/api/debug',
      '/api/internal/export',
    ];
    return [
      ...traps.map((source) => ({ source, destination: `/api/security/trap?path=${encodeURIComponent(source)}` })),
      {
        source: '/games/api/discord-callback.php',
        destination: '/api/oauth/discord/callback',
      },
      { source: '/studio.js', destination: '/maker/studio.js' },
      { source: '/studios', destination: '/studios/index.html' },
      { source: '/studios/', destination: '/studios/index.html' },
      { source: '/maker', destination: '/maker/index.html' },
      { source: '/maker/', destination: '/maker/index.html' },
    ];
  },
  async redirects() {
    const folders = [
      '/games/unix/tap',
      '/games/unix/1',
      '/games/unix/puck',
      '/games/unix/fruitninja',
      '/games/unix/dash',
      '/games/unix/chicken',
      '/games/mtjump',
      '/games/unix/soccer',
      '/games/unix/taptap',
      '/games/2',
      '/games/racer',
      '/games/pocket',
      '/games/gallery',
    ];
    return [
      { source: '/devs', destination: 'https://driver-panda.vercel.app', permanent: false },
      { source: '/devs/', destination: 'https://driver-panda.vercel.app/', permanent: false },
      { source: '/claims.html', destination: '/claims', permanent: true },
      { source: '/casino-floor', destination: '/casino-floor/index.html', permanent: false },
      { source: '/casino-floor/', destination: '/casino-floor/index.html', permanent: false },
      ...folders.flatMap((p) => [
        { source: p, destination: `${p}/index.html`, permanent: false },
        { source: `${p}/`, destination: `${p}/index.html`, permanent: false },
      ]),
    ];
  },
};

export default nextConfig;
