import { NextRequest } from 'next/server';
import { getPortalDb } from '@/lib/rewards-db';
import { checkPassword, ensurePortalColumns, readSessionToken, userBySession } from '@/lib/portal-auth';
import { makeTotpSecret, totpMatches, totpUri } from '@/lib/totp';

export async function GET() {
  const me = await userBySession(await readSessionToken());
  if (!me) return Response.json({ ok: false }, { status: 401 });
  const conn = await getPortalDb();
  try {
    await ensurePortalColumns(conn);
    const [rows] = await conn.execute('SELECT totp_enabled FROM portal_users WHERE id = ? LIMIT 1', [me.id]);
    const on = Number((rows as { totp_enabled?: number }[])[0]?.totp_enabled || 0) === 1;
    return Response.json({ ok: true, enabled: on });
  } finally {
    await conn.end();
  }
}

export async function POST(request: NextRequest) {
  const me = await userBySession(await readSessionToken());
  if (!me) return Response.json({ ok: false, error: 'Sign in first.' }, { status: 401 });
  let body: { action?: string; code?: string; password?: string } = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }
  const conn = await getPortalDb();
  try {
    await ensurePortalColumns(conn);
    if (body.action === 'start') {
      const secret = makeTotpSecret();
      await conn.execute('UPDATE portal_users SET totp_secret = ?, totp_enabled = 0 WHERE id = ?', [secret, me.id]);
      return Response.json({ ok: true, secret, uri: totpUri(secret, me.email || me.username) });
    }
    const [rows] = await conn.execute(
      'SELECT totp_secret, password_hash FROM portal_users WHERE id = ? LIMIT 1',
      [me.id]
    );
    const row = (rows as { totp_secret: string | null; password_hash: string }[])[0];
    if (!row?.totp_secret || !totpMatches(row.totp_secret, body.code || '')) {
      return Response.json({ ok: false, error: 'That code does not match.' }, { status: 400 });
    }
    if (body.action === 'disable') {
      if (!(await checkPassword(body.password || '', row.password_hash))) {
        return Response.json({ ok: false, error: 'Password does not match.' }, { status: 400 });
      }
      await conn.execute('UPDATE portal_users SET totp_secret = NULL, totp_enabled = 0 WHERE id = ?', [me.id]);
      return Response.json({ ok: true, enabled: false });
    }
    await conn.execute('UPDATE portal_users SET totp_enabled = 1 WHERE id = ?', [me.id]);
    return Response.json({ ok: true, enabled: true });
  } finally {
    await conn.end();
  }
}
