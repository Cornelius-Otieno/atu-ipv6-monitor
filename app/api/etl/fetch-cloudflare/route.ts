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

    const token = process.env.CLOUDFLARE_RADAR_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'CLOUDFLARE_RADAR_TOKEN not configured' }, { status: 400 });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    let updated = 0;
    const errors: string[] = [];

    // Use Cloudflare Radar API for each country
    for (const cc of AFRICAN_CCS) {
      try {
        const url = `https://api.cloudflare.com/client/v4/radar/http/summary/ip_version?location=${cc}&dateRange=1d&format=json`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) {
          errors.push(`${cc}: HTTP ${res.status}`);
          continue;
        }
        const data = await res.json();
        const summary = data?.result?.summary_0 ?? data?.result?.summary ?? null;
        if (!summary) {
          errors.push(`${cc}: no summary data`);
          continue;
        }

        const ipv6Pct = parseFloat(summary?.IPv6 ?? summary?.ipv6 ?? '0') || 0;

        await prisma.cloudflareMetric.upsert({
          where: { date_cc: { date: today, cc } },
          update: { ipv6TrafficPct: ipv6Pct },
          create: { date: today, cc, ipv6TrafficPct: ipv6Pct, source: 'Cloudflare' },
        });
        updated++;
      } catch (e: any) {
        errors.push(`${cc}: ${e?.message ?? 'unknown'}`);
      }
    }

    await prisma.etlLog.create({
      data: {
        source: 'Cloudflare',
        status: errors.length > 0 ? 'partial' : 'success',
        countriesUpdated: updated,
        message: errors.length > 0 ? errors.slice(0, 10).join('; ') : 'All countries fetched',
      },
    });

    return NextResponse.json({ updated, errors: errors.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Internal error' }, { status: 500 });
  }
}
