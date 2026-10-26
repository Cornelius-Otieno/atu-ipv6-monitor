export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get latest metrics for each country
    const latestDate = await prisma.countryMetric.findFirst({
      orderBy: { date: 'desc' },
      select: { date: true },
    });

    if (!latestDate?.date) {
      return NextResponse.json({ countries: [], kpis: {}, lastUpdated: null });
    }

    const currentDate = latestDate.date;

    // Get all current metrics with country info
    const currentMetrics = await prisma.countryMetric.findMany({
      where: { date: currentDate },
      include: { country: true },
      orderBy: { preferredPc: 'desc' },
    });

    // Get 30 days ago metrics for change calculation
    const thirtyDaysAgo = new Date(currentDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldMetrics = await prisma.countryMetric.findMany({
      where: { date: { gte: thirtyDaysAgo, lt: currentDate } },
      orderBy: { date: 'desc' },
      distinct: ['cc'],
    });

    const oldMap = new Map(oldMetrics.map((m: any) => [m.cc, m]));

    // Get latest AFRINIC allocations
    const allocations = await prisma.afrinicAllocation.findMany({
      orderBy: { date: 'desc' },
      distinct: ['cc'],
    });
    const allocMap = new Map(allocations.map((a: any) => [a.cc, a]));

    // Get latest Cloudflare metrics
    const cfMetrics = await prisma.cloudflareMetric.findMany({
      orderBy: { date: 'desc' },
      distinct: ['cc'],
    });
    const cfMap = new Map(cfMetrics.map((c: any) => [c.cc, c]));

    // Build country data
    const countries = currentMetrics.map((m: any) => {
      const old = oldMap.get(m.cc);
      const alloc = allocMap.get(m.cc);
      const cf = cfMap.get(m.cc);
      const change30d = old ? Number(m.preferredPc) - Number(old.preferredPc) : null;

      return {
        cc: m.cc,
        name: m.country?.name ?? m.cc,
        subRegion: m.country?.subRegion ?? 'Unknown',
        isTestbed: m.country?.isTestbed ?? false,
        preferredPc: Number(m.preferredPc ?? 0),
        capablePc: Number(m.capablePc ?? 0),
        sampleN: m.sampleN ?? 0,
        change30d,
        allocations32s: alloc ? Number(alloc.total32s) : 0,
        allocationCount: alloc?.allocationCount ?? 0,
        cloudflareTrafficPct: cf ? Number(cf.ipv6TrafficPct) : null,
      };
    });

    // KPIs
    const avgPreferred = countries?.length > 0
      ? countries.reduce((s: number, c: any) => s + (c?.preferredPc ?? 0), 0) / countries.length
      : 0;
    const avgCapable = countries?.length > 0
      ? countries.reduce((s: number, c: any) => s + (c?.capablePc ?? 0), 0) / countries.length
      : 0;
    const above10 = countries.filter((c: any) => (c?.preferredPc ?? 0) >= 10).length;
    const avgChange30d = countries?.length > 0
      ? countries.reduce((s: number, c: any) => s + (c?.change30d ?? 0), 0) / countries.length
      : 0;

    // Last ETL log
    const lastEtl = await prisma.etlLog.findFirst({ orderBy: { runAt: 'desc' } });

    return NextResponse.json({
      countries,
      kpis: {
        avgPreferred: Math.round(avgPreferred * 100) / 100,
        avgCapable: Math.round(avgCapable * 100) / 100,
        above10,
        avgChange30d: Math.round(avgChange30d * 100) / 100,
        totalCountries: countries.length,
      },
      lastUpdated: currentDate.toISOString(),
      lastEtl: lastEtl?.runAt?.toISOString?.() ?? null,
    });
  } catch (e: any) {
    console.error('Overview API error:', e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
