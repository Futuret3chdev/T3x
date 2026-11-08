import crypto from 'crypto';

const ALPH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function makeTotpSecret() {
  const bytes = crypto.randomBytes(20);
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPH[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPH[(value << (5 - bits)) & 31];
  return out;
}

function decodeBase32(input: string) {
  const clean = input.replace(/=+$/g, '').toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of clean) {
    const idx = ALPH.indexOf(char);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function totpCode(secret: string, at = Date.now()) {
  const counter = Math.floor(at / 30000);
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac('sha1', decodeBase32(secret)).update(msg).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const bin = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1000000;
  return bin.toString().padStart(6, '0');
}

export function totpMatches(secret: string, code: string) {
  const clean = String(code || '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(clean)) return false;
  const now = Date.now();
  return [-1, 0, 1].some((step) => {
    const expected = totpCode(secret, now + step * 30000);
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(clean));
  });
}

export function totpUri(secret: string, account: string) {
  return `otpauth://totp/T3x:${encodeURIComponent(account)}?secret=${secret}&issuer=T3x&digits=6&period=30`;
}
