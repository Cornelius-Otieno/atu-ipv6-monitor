export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const baseUrl = req.nextUrl.origin;
    const etlSecret = process.env.ETL_SECRET ?? '';

    const r = await fetch(`${baseUrl}/api/etl/run-all`, {
      method: 'POST',
      headers: { 'x-etl-secret': etlSecret, 'Content-Type': 'application/json' },
    });
    const data = await r.json();
    return NextResponse.json({ status: 'ok', ...data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
