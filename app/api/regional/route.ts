export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

    // Group by sub-region
    const regionMap = new Map<string, any[]>();
    for (const m of metrics) {
      const region = m.country?.subRegion ?? 'Unknown';
      if (!regionMap.has(region)) regionMap.set(region, []);
      regionMap.get(region)?.push({
        cc: m.cc,
        name: m.country?.name ?? m.cc,
        isTestbed: m.country?.isTestbed ?? false,
        preferredPc: Number(m.preferredPc ?? 0),
        capablePc: Number(m.capablePc ?? 0),
      });
    }

    const regions = Array.from(regionMap.entries()).map(([name, countries]: [string, any[]]) => {
      const avgPreferred = countries?.length > 0
        ? countries.reduce((s: number, c: any) => s + (c?.preferredPc ?? 0), 0) / countries.length
        : 0;
      const avgCapable = countries?.length > 0
        ? countries.reduce((s: number, c: any) => s + (c?.capablePc ?? 0), 0) / countries.length
        : 0;
      return {
        name,
        avgPreferred: Math.round(avgPreferred * 100) / 100,
        avgCapable: Math.round(avgCapable * 100) / 100,
        countryCount: countries.length,
        countries: countries.sort((a: any, b: any) => (b?.preferredPc ?? 0) - (a?.preferredPc ?? 0)),
      };
    }).sort((a: any, b: any) => (b?.avgPreferred ?? 0) - (a?.avgPreferred ?? 0));

    // Time series by region
    const allMetrics = await prisma.countryMetric.findMany({
      include: { country: true },
      orderBy: { date: 'asc' },
    });

    const timeSeriesMap = new Map<string, Map<string, { sum: number; count: number }>>(); // region -> date -> avg
    for (const m of allMetrics) {
      const region = m.country?.subRegion ?? 'Unknown';
      const dateStr = m.date?.toISOString?.()?.split?.('T')?.[0] ?? '';
      if (!timeSeriesMap.has(region)) timeSeriesMap.set(region, new Map());
      const regionTs = timeSeriesMap.get(region)!;
      if (!regionTs.has(dateStr)) regionTs.set(dateStr, { sum: 0, count: 0 });
      const entry = regionTs.get(dateStr)!;
      entry.sum += Number(m.preferredPc ?? 0);
      entry.count++;
    }

    const timeSeries: Record<string, any[]> = {};
    for (const [region, dateMap] of timeSeriesMap) {
      timeSeries[region] = Array.from(dateMap.entries()).map(([date, v]: [string, any]) => ({
        date,
        avgPreferred: v.count > 0 ? Math.round((v.sum / v.count) * 100) / 100 : 0,
      }));
    }

    return NextResponse.json({ regions, timeSeries, lastUpdated: currentDate.toISOString() });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
