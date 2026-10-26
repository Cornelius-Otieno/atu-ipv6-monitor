export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-etl-secret') ?? (await req.json().catch(() => ({}))).secret;
    if (secret !== process.env.ETL_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const baseUrl = req.nextUrl.origin;
    const headers = { 'x-etl-secret': process.env.ETL_SECRET ?? '', 'Content-Type': 'application/json' };
    const results: Record<string, any> = {};

    // APNIC
    try {
      const r = await fetch(`${baseUrl}/api/etl/fetch-apnic`, { method: 'POST', headers });
      results.apnic = await r.json();
    } catch (e: any) {
      results.apnic = { error: e?.message };
    }

    // AFRINIC
    try {
      const r = await fetch(`${baseUrl}/api/etl/fetch-afrinic`, { method: 'POST', headers });
      results.afrinic = await r.json();
    } catch (e: any) {
      results.afrinic = { error: e?.message };
    }

    // Cloudflare
    try {
      const r = await fetch(`${baseUrl}/api/etl/fetch-cloudflare`, { method: 'POST', headers });
      results.cloudflare = await r.json();
    } catch (e: any) {
      results.cloudflare = { error: e?.message };
    }

    return NextResponse.json({ status: 'completed', results });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Internal error' }, { status: 500 });
  }
}
