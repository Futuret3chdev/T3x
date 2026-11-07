import { NextRequest } from 'next/server';
import { getPortalDb } from '@/lib/rewards-db';
import {
  attachLicense,
  checkPassword,
  ensurePortalColumns,
  newSessionToken,
  publicUser,
  writeSessionCookie,
  type PortalUser,
} from '@/lib/portal-auth';

export async function POST(request: NextRequest) {
  let body: { email?: string; username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }
  const login = (body.email || body.username || '').trim().toLowerCase();
  const password = body.password || '';
  if (!login || !password) {
    return Response.json({ ok: false, error: 'Email or username, and a password, are required.' }, { status: 400 });
  }

  let conn;
  try {
    conn = await getPortalDb();
    await ensurePortalColumns(conn);
    const [rows] = await conn.execute(
      `SELECT id, username, email, password_hash, wallet_address, license_key, license_tier, bio, avatar_url,
              CAST(telegram_id AS CHAR) AS telegram_id,
              CAST(discord_id AS CHAR) AS discord_id
       FROM portal_users WHERE email = ? OR username = ? LIMIT 1`,
      [login, login]
    );
    const row = (rows as (PortalUser & { password_hash: string })[])[0];
    if (!row || !(await checkPassword(password, row.password_hash))) {
      return Response.json({ ok: false, error: 'Invalid email or password.' }, { status: 401 });
    }
    const token = newSessionToken();
    await conn.execute('UPDATE portal_users SET session_token = ?, last_login = NOW() WHERE id = ?', [
      token,
      row.id,
    ]);
    try {
      const lic = await attachLicense(conn, row);
      row.license_key = lic.license_key;
      row.license_tier = lic.license_tier;
    } catch (licErr) {
      console.error('portal login license', licErr);
    }
    await writeSessionCookie(token);
    return Response.json({ ok: true, user: publicUser(row) });
  } catch (err) {
    console.error('portal login', err);
    const detail = err instanceof Error ? err.message : 'unknown';
    const denied = /access denied|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|doesn't exist|does not exist/i.test(detail);
    return Response.json(
      {
        ok: false,
        error: denied
          ? 'The account database is blocking this server. In HostGator Remote Database Access, add host % for tcvkxete_t3xadmin, then try again.'
          : `Could not log in right now. ${detail}`,
      },
      { status: 500 }
    );
  } finally {
    await conn?.end();
  }
}
