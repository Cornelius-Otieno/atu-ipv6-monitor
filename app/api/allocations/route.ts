export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fetchApnicCountrySummaries } from '@/lib/apnic';

export async function GET() {
  try {
    // Get latest allocations per country
    const allocations = await prisma.afrinicAllocation.findMany({
      orderBy: { date: 'desc' },
      distinct: ['cc'],
      include: { country: true },
    });

    // Get latest metrics for adoption gap
    const latestDate = await prisma.countryMetric.findFirst({
      orderBy: { date: 'desc' },
      select: { date: true },
    });

    const metrics = latestDate?.date
      ? await prisma.countryMetric.findMany({ where: { date: latestDate.date } })
      : [];
    const metricsMap = new Map(metrics.map((m: any) => [m.cc, m]));
    const apnicCountrySummaries = await fetchApnicCountrySummaries();

    const data = allocations.map((a: any) => {
      const metric = metricsMap.get(a.cc);
      const preferredPc = apnicCountrySummaries[a.cc]?.preferredPc ?? Number(metric?.preferredPc ?? 0);
      return {
        cc: a.cc,
        name: a.country?.name ?? a.cc,
        subRegion: a.country?.subRegion ?? 'Unknown',
        isTestbed: a.country?.isTestbed ?? false,
        allocationCount: a.allocationCount,
        total32s: Number(a.total32s),
        allocationDate: a.date?.toISOString?.()?.split?.('T')?.[0] ?? '',
        preferredPc,
        adoptionGap: Number(a.total32s) > 0 && preferredPc < 5,
      };
    }).sort((a: any, b: any) => (b?.total32s ?? 0) - (a?.total32s ?? 0));

    return NextResponse.json({ allocations: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
