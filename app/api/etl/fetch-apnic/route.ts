export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const AFRICAN_CCS = [
  'DZ','AO','BJ','BW','BF','BI','CM','CV','CF','TD','KM','CG','CD','CI','DJ',
  'EG','GQ','ER','SZ','ET','GA','GM','GH','GN','GW','KE','LS','LR','LY','MG',
  'MW','ML','MR','MU','MA','MZ','NA','NE','NG','RW','ST','SN','SC','SL','SO',
  'ZA','SS','SD','TZ','TG','TN','UG','ZM','ZW'
];

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-etl-secret') ?? (await req.json().catch(() => ({}))).secret;
    if (secret !== process.env.ETL_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    let updated = 0;
    const errors: string[] = [];

    for (const cc of AFRICAN_CCS) {
      try {
        const url = `https://data1.labs.apnic.net/v6stats/v6economy/${cc}.json`;
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!res.ok) {
          errors.push(`${cc}: HTTP ${res.status}`);
          continue;
        }
        const data = await res.json();
        const rows = data?.data ?? [];
        if (!Array.isArray(rows) || rows.length === 0) {
          errors.push(`${cc}: no data`);
          continue;
        }

        // Last row = most recent data. Fields are nested under 'raw'
        const row = rows[rows.length - 1];
        const raw = row?.raw ?? row;
        const preferredPc = parseFloat(raw?.preferred_pc ?? raw?.pref_percent ?? '0') || 0;
        const capablePc = parseFloat(raw?.capable_pc ?? raw?.able_percent ?? '0') || 0;
        const sampleN = parseInt(raw?.seen ?? raw?.n ?? '0', 10) || 0;

        await prisma.countryMetric.upsert({
          where: { date_cc: { date: today, cc } },
          update: { preferredPc, capablePc, sampleN },
          create: { date: today, cc, preferredPc, capablePc, sampleN, source: 'APNIC' },
        });
        updated++;
      } catch (e: any) {
        errors.push(`${cc}: ${e?.message ?? 'unknown error'}`);
      }
    }

    await prisma.etlLog.create({
      data: {
        source: 'APNIC',
        status: errors.length > 0 ? 'partial' : 'success',
        countriesUpdated: updated,
        message: errors.length > 0 ? errors.join('; ') : 'All countries fetched successfully',
      },
    });

    return NextResponse.json({ updated, errors: errors.length, total: AFRICAN_CCS.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Internal error' }, { status: 500 });
  }
}
