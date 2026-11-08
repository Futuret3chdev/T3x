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
import { totpMatches } from '@/lib/totp';
import { clientIp, logSecurity, looksAutomated, tooManyFailures } from '@/lib/security-log';

export async function POST(request: NextRequest) {
  let body: { email?: string; username?: string; password?: string; code?: string; company_website?: string; fax_number?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }
  const ip = clientIp(request);
  if (looksAutomated(body)) {
    await logSecurity('honeypot', ip, '/api/portal/login', 'hidden field');
    return Response.json({ ok: false, error: 'Invalid email or password.' }, { status: 401 });
  }
  if (await tooManyFailures(ip)) {
    return Response.json({ ok: false, error: 'Too many attempts. Wait 15 minutes.' }, { status: 429 });
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
              CAST(discord_id AS CHAR) AS discord_id,
              totp_secret, totp_enabled
       FROM portal_users WHERE email = ? OR username = ? LIMIT 1`,
      [login, login]
    );
    const row = (rows as (PortalUser & { password_hash: string; totp_secret?: string | null; totp_enabled?: number })[])[0];
    if (!row || !(await checkPassword(password, row.password_hash))) {
      await logSecurity('login_fail', ip, '/api/portal/login', login.slice(0, 80));
      return Response.json({ ok: false, error: 'Invalid email or password.' }, { status: 401 });
    }
    if (Number(row.totp_enabled) === 1) {
      if (!body.code) return Response.json({ ok: false, need2fa: true, error: 'Enter the 6-digit authenticator code.' }, { status: 401 });
      if (!row.totp_secret || !totpMatches(row.totp_secret, body.code)) {
        await logSecurity('login_fail', ip, '/api/portal/login', 'bad-2fa');
        return Response.json({ ok: false, need2fa: true, error: 'That code does not match.' }, { status: 401 });
      }
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
