export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const AFRICAN_CCS = new Set([
  'DZ','AO','BJ','BW','BF','BI','CM','CV','CF','TD','KM','CG','CD','CI','DJ',
  'EG','GQ','ER','SZ','ET','GA','GM','GH','GN','GW','KE','LS','LR','LY','MG',
  'MW','ML','MR','MU','MA','MZ','NA','NE','NG','RW','ST','SN','SC','SL','SO',
  'ZA','SS','SD','TZ','TG','TN','UG','ZM','ZW'
]);

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-etl-secret') ?? (await req.json().catch(() => ({}))).secret;
    if (secret !== process.env.ETL_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const res = await fetch('https://ftp.afrinic.net/stats/afrinic/delegated-afrinic-latest', {
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      return NextResponse.json({ error: `AFRINIC fetch failed: ${res.status}` }, { status: 502 });
    }

    const text = await res.text();
    const lines = text.split('\n');

    // Aggregate per country: count allocations and total /32 equivalent
    const countryMap = new Map<string, { count: number; total32s: number }>();

    for (const line of lines) {
      if (line.startsWith('#') || line.startsWith('*')) continue;
      const parts = line.split('|');
      if (parts?.length < 7) continue;
      const registry = parts?.[0];
      const cc = parts?.[1]?.toUpperCase?.() ?? '';
      const type = parts?.[2];
      const prefix = parts?.[3];
      const prefixLen = parseInt(parts?.[4] ?? '0', 10);

      if (registry !== 'afrinic' || type !== 'ipv6' || !AFRICAN_CCS.has(cc)) continue;

      const existing = countryMap.get(cc) ?? { count: 0, total32s: 0 };
      existing.count++;
      // Convert to /32 equivalents: 2^(32-prefixLen)
      const equiv32 = Math.pow(2, 32 - prefixLen);
      existing.total32s += equiv32;
      countryMap.set(cc, existing);
    }

    let updated = 0;
    for (const [cc, data] of countryMap) {
      await prisma.afrinicAllocation.upsert({
        where: { date_cc: { date: today, cc } },
        update: { allocationCount: data.count, total32s: data.total32s },
        create: { date: today, cc, allocationCount: data.count, total32s: data.total32s, source: 'AFRINIC' },
      });
      updated++;
    }

    await prisma.etlLog.create({
      data: {
        source: 'AFRINIC',
        status: 'success',
        countriesUpdated: updated,
        message: `Parsed ${lines.length} lines, updated ${updated} countries`,
      },
    });

    return NextResponse.json({ updated, linesProcessed: lines.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Internal error' }, { status: 500 });
  }
}
