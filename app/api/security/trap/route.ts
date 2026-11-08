import { NextRequest } from 'next/server';
import { clientIp, logSecurity } from '@/lib/security-log';

const FORM = `<!doctype html><html><head><meta charset="utf-8"><title>Sign in</title></head><body style="font-family:sans-serif;background:#111;color:#eee">
<h1>Sign in</h1>
<form method="post"><label>User <input name="user"></label><label>Password <input name="pass" type="password"></label><button>Sign in</button></form>
<p>Invalid username or password.</p></body></html>`;

async function note(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path') || request.nextUrl.pathname;
  const ip = clientIp(request);
  let who = '';
  if (request.method === 'POST') {
    const text = await request.clone().text();
    const user = text.match(/(?:user|username|log)=([^&]{0,80})/i)?.[1] || '';
    who = decodeURIComponent(user).slice(0, 80);
  }
  await logSecurity('trap', ip, path, who);
}

export async function GET(request: NextRequest) {
  await note(request);
  const path = request.nextUrl.searchParams.get('path') || '';
  if (/wp-login|phpmyadmin|administrator/i.test(path)) {
    return new Response(FORM, { status: 401, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
  }
  return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  await note(request);
  return new Response(FORM, { status: 401, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
