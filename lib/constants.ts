export const MT_CONTRACT =
  'ELywDcVX2WumHm4xEfqF8NdEKaeGCAaq9JmwtjE8pump';

export const LINKS = {
  raydium: `https://raydium.io/swap/?inputMint=sol&outputMint=${MT_CONTRACT}`,
  jupiter: `https://jup.ag/swap/SOL-${MT_CONTRACT}`,
  pumpfun: `https://pump.fun/coin/${MT_CONTRACT}`,
  wallet: 'https://t3x-wallet.vercel.app/', // custom domain for the infinite-wallet vercel project; falls back to vercel.app if needed
  // Future self-hosted
  docs: '#',
  api: '#',
};
