import { NextRequest } from 'next/server';
import { getPortalDb } from '@/lib/rewards-db';
import { clientIp, logSecurity, looksAutomated } from '@/lib/security-log';
import {
  attachLicense,
  hashPassword,
  newSessionToken,
  publicUser,
  writeSessionCookie,
  type PortalUser,
} from '@/lib/portal-auth';

export async function POST(request: NextRequest) {
  let body: { username?: string; email?: string; password?: string; company_website?: string; fax_number?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }
  if (looksAutomated(body)) {
    await logSecurity('honeypot', clientIp(request), '/api/portal/register', 'hidden field');
    return Response.json({ ok: false, error: 'Could not create that account.' }, { status: 400 });
  }
  const username = (body.username || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';
  if (username.length < 3) {
    return Response.json({ ok: false, error: 'Username must be at least 3 characters.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ ok: false, error: 'A real email is required.' }, { status: 400 });
  }
  if (password.length < 6) {
    return Response.json({ ok: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
  }

  let conn;
  try {
    conn = await getPortalDb();
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS portal_users (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) NOT NULL,
        email VARCHAR(190) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        session_token VARCHAR(128) NULL,
        wallet_address VARCHAR(80) NULL,
        license_key VARCHAR(40) NULL,
        license_tier VARCHAR(16) NULL,
        bio TEXT NULL,
        avatar_url TEXT NULL,
        telegram_id VARCHAR(64) NULL,
        discord_id VARCHAR(64) NULL,
        is_admin TINYINT NOT NULL DEFAULT 0,
        created_at DATETIME NULL,
        last_login DATETIME NULL,
        UNIQUE KEY uniq_email (email),
        UNIQUE KEY uniq_username (username),
        KEY idx_session (session_token)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    const [dup] = await conn.execute(
      'SELECT id FROM portal_users WHERE email = ? OR username = ? LIMIT 1',
      [email, username]
    );
    if ((dup as { id: number }[])[0]) {
      return Response.json({ ok: false, error: 'Email or username already registered. Log in instead.' }, { status: 409 });
    }
    const hash = await hashPassword(password);
    const token = newSessionToken();
    await conn.execute(
      'INSERT INTO portal_users (username, email, password_hash, session_token, created_at, last_login, is_admin) VALUES (?,?,?,?,NOW(),NOW(),0)',
      [username, email, hash, token]
    );
    const [createdRows] = await conn.execute(
      'SELECT id, username, email, wallet_address, license_key, license_tier FROM portal_users WHERE email = ? LIMIT 1',
      [email]
    );
    const created = (createdRows as PortalUser[])[0];
    if (!created) {
      return Response.json({ ok: false, error: 'Account insert did not return a profile.' }, { status: 500 });
    }
    let lic = { license_key: created.license_key || '', license_tier: created.license_tier || 'free' };
    try {
      lic = await attachLicense(conn, {
        id: created.id,
        username: created.username,
        email: created.email,
      });
    } catch (licErr) {
      console.error('portal register license', licErr);
    }
    created.license_key = lic.license_key || created.license_key;
    created.license_tier = lic.license_tier || created.license_tier;
    await writeSessionCookie(token);
    return Response.json({ ok: true, created: true, user: publicUser(created) });
  } catch (err) {
    console.error('portal register', err);
    const detail = err instanceof Error ? err.message : 'unknown';
    const denied = /access denied|ECONNREFUSED|ETIMEDOUT|ENOTFOUND/i.test(detail);
    return Response.json(
      {
        ok: false,
        error: denied
          ? 'The account database is blocking this server. In HostGator Remote Database Access, add host % for tcvkxete_t3xadmin, then try again.'
          : `Could not create the account. ${detail}`,
      },
      { status: 500 }
    );
  } finally {
    await conn?.end();
  }
}
