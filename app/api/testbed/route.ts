export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const testbedCountries = await prisma.country.findMany({
      where: { isTestbed: true },
    });

    const results = [];
    for (const c of testbedCountries) {
      const latest = await prisma.countryMetric.findFirst({
        where: { cc: c.cc },
        orderBy: { date: 'desc' },
      });

      const timeSeries = await prisma.countryMetric.findMany({
        where: { cc: c.cc },
        orderBy: { date: 'asc' },
      });

      const alloc = await prisma.afrinicAllocation.findFirst({
        where: { cc: c.cc },
        orderBy: { date: 'desc' },
      });

      const cf = await prisma.cloudflareMetric.findFirst({
        where: { cc: c.cc },
        orderBy: { date: 'desc' },
      });

      // 30-day change
      const thirtyDaysAgo = latest?.date ? new Date(latest.date) : new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const oldMetric = await prisma.countryMetric.findFirst({
        where: { cc: c.cc, date: { lte: thirtyDaysAgo } },
        orderBy: { date: 'desc' },
      });

      // 90-day change
      const ninetyDaysAgo = latest?.date ? new Date(latest.date) : new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const old90 = await prisma.countryMetric.findFirst({
        where: { cc: c.cc, date: { lte: ninetyDaysAgo } },
        orderBy: { date: 'desc' },
      });

      results.push({
        cc: c.cc,
        name: c.name,
        subRegion: c.subRegion,
        testbedNotes: c.testbedNotes,
        preferredPc: Number(latest?.preferredPc ?? 0),
        capablePc: Number(latest?.capablePc ?? 0),
        sampleN: latest?.sampleN ?? 0,
        allocations32s: alloc ? Number(alloc.total32s) : 0,
        cloudflareTrafficPct: cf ? Number(cf.ipv6TrafficPct) : null,
        change30d: oldMetric ? Number(latest?.preferredPc ?? 0) - Number(oldMetric.preferredPc ?? 0) : null,
        change90d: old90 ? Number(latest?.preferredPc ?? 0) - Number(old90.preferredPc ?? 0) : null,
        timeSeries: timeSeries.map((m: any) => ({
          date: m.date?.toISOString?.()?.split?.('T')?.[0] ?? '',
          preferredPc: Number(m.preferredPc ?? 0),
          capablePc: Number(m.capablePc ?? 0),
        })),
      });
    }

    return NextResponse.json({ countries: results });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
