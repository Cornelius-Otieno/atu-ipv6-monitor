export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { APNIC_REGIONS, fetchApnicCountrySummaries, fetchApnicRegionSeries, fetchApnicRegionSummaries } from '@/lib/apnic';

export async function GET() {
  try {
    const latestDate = await prisma.countryMetric.findFirst({
      orderBy: { date: 'desc' },
      select: { date: true },
    });

    if (!latestDate?.date) {
      return NextResponse.json({ regions: [] });
    }

    const currentDate = latestDate.date;

    const metrics = await prisma.countryMetric.findMany({
      where: { date: currentDate },
      include: { country: true },
    });
    const apnicCountrySummaries = await fetchApnicCountrySummaries();

    // Group country rows by the local sub-region labels.
    const regionMap = new Map<string, any[]>();
    for (const m of metrics) {
      const region = m.country?.subRegion ?? 'Unknown';
      if (!regionMap.has(region)) regionMap.set(region, []);
      const apnic = apnicCountrySummaries[m.cc];
      regionMap.get(region)?.push({
        cc: m.cc,
        name: m.country?.name ?? m.cc,
        isTestbed: m.country?.isTestbed ?? false,
        preferredPc: apnic?.preferredPc ?? Number(m.preferredPc ?? 0),
        capablePc: apnic?.capablePc ?? Number(m.capablePc ?? 0),
      });
    }

    const [timeSeries, summaries] = await Promise.all([
      fetchApnicRegionSeries(),
      fetchApnicRegionSummaries(),
    ]);
    const regions = APNIC_REGIONS.map(({ name }) => {
      const countries = regionMap.get(name) ?? [];
      const latest = timeSeries[name]?.at(-1);
      const summary = summaries[name];
      return {
        name,
        avgPreferred: summary?.preferredPc ?? latest?.preferredPc ?? null,
        avgCapable: summary?.capablePc ?? latest?.capablePc ?? null,
        samples: summary?.sampleN ?? null,
        weight: summary?.weight ?? null,
        weightedSamples: summary?.weightedSamples ?? null,
        countryCount: countries.length,
        countries: countries.sort((a: any, b: any) => (b?.preferredPc ?? 0) - (a?.preferredPc ?? 0)),
      };
    }).sort((a, b) => (b.avgPreferred ?? 0) - (a.avgPreferred ?? 0));

    return NextResponse.json({ regions, timeSeries, lastUpdated: currentDate.toISOString() });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
