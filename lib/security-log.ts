import type { NextRequest } from 'next/server';
import { getPortalDb } from '@/lib/rewards-db';

export function clientIp(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for') || '';
  return (forwarded.split(',')[0] || request.headers.get('x-real-ip') || 'unknown').trim().slice(0, 64);
}

export function looksAutomated(body: { company_website?: string; fax_number?: string }) {
  return Boolean(String(body.company_website || '').trim() || String(body.fax_number || '').trim());
}

export async function logSecurity(kind: string, ip: string, path: string, note = '') {
  let conn;
  try {
    conn = await getPortalDb();
    await conn.execute(
      `CREATE TABLE IF NOT EXISTS security_events (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        kind VARCHAR(32) NOT NULL,
        ip VARCHAR(64) NOT NULL,
        path VARCHAR(190) NOT NULL,
        note VARCHAR(255) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY ip_time (ip, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    );
    await conn.execute('INSERT INTO security_events (kind, ip, path, note) VALUES (?,?,?,?)', [
      kind.slice(0, 32),
      ip.slice(0, 64),
      path.slice(0, 190),
      note.slice(0, 255),
    ]);
  } catch {
    /* a missed log must not take the site down */
  } finally {
    await conn?.end();
  }
}

export async function tooManyFailures(ip: string) {
  let conn;
  try {
    conn = await getPortalDb();
    const [rows] = await conn.execute(
      `SELECT COUNT(*) AS n FROM security_events
       WHERE kind = 'login_fail' AND ip = ? AND created_at > (NOW() - INTERVAL 15 MINUTE)`,
      [ip]
    );
    return Number((rows as { n: number }[])[0]?.n || 0) >= 8;
  } catch {
    return false;
  } finally {
    await conn?.end();
  }
}
