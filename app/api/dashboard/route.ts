export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const latestDate = await prisma.countryMetric.findFirst({
      orderBy: { date: 'desc' },
      select: { date: true },
    });

    const currentDate = latestDate?.date ?? new Date();

    // KPIs
    const currentMetrics = await prisma.countryMetric.findMany({
      where: { date: currentDate },
      include: { country: true },
    });

    const thirtyDaysAgo = new Date(currentDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const oldMetrics = await prisma.countryMetric.findMany({
      where: { date: { gte: thirtyDaysAgo, lt: currentDate } },
      orderBy: { date: 'desc' },
      distinct: ['cc'],
    });
    const oldMap = new Map(oldMetrics.map((m: any) => [m.cc, Number(m.preferredPc ?? 0)]));

    const total = currentMetrics?.length ?? 0;
    const avgPreferred = total > 0
      ? currentMetrics.reduce((s: number, m: any) => s + Number(m.preferredPc ?? 0), 0) / total
      : 0;
    const avgCapable = total > 0
      ? currentMetrics.reduce((s: number, m: any) => s + Number(m.capablePc ?? 0), 0) / total
      : 0;
    const above10 = currentMetrics.filter((m: any) => Number(m.preferredPc ?? 0) >= 10).length;

    const changes = currentMetrics.map((m: any) => {
      const old = oldMap.get(m.cc);
      return old !== undefined ? Number(m.preferredPc ?? 0) - old : 0;
    });
    const avgChange = changes?.length > 0 ? changes.reduce((a: number, b: number) => a + b, 0) / changes.length : 0;

    // Time series for area chart
    const allMetrics = await prisma.countryMetric.findMany({
      orderBy: { date: 'asc' },
    });

    const dateMap = new Map<string, { sum: number; count: number }>(); 
    for (const m of allMetrics) {
      const d = m.date?.toISOString?.()?.split?.('T')?.[0] ?? '';
      if (!dateMap.has(d)) dateMap.set(d, { sum: 0, count: 0 });
      const entry = dateMap.get(d)!;
      entry.sum += Number(m.preferredPc ?? 0);
      entry.count++;
    }

    // NOTE: the viz kit's `percent` formatter multiplies by 100, so all
    // percent-formatted values are emitted as fractions (actual % / 100).
    const trendData = Array.from(dateMap.entries()).map(([date, v]: [string, any]) => ({
      date,
      avg_preferred: v.count > 0 ? (v.sum / v.count) / 100 : 0,
    }));

    // Regional breakdown for bar chart
    const regionMap = new Map<string, { sum: number; count: number }>();
    for (const m of currentMetrics) {
      const region = m.country?.subRegion ?? 'Unknown';
      if (!regionMap.has(region)) regionMap.set(region, { sum: 0, count: 0 });
      const entry = regionMap.get(region)!;
      entry.sum += Number(m.preferredPc ?? 0);
      entry.count++;
    }

    const regionData = Array.from(regionMap.entries()).map(([region, v]: [string, any]) => ({
      region,
      avg_preferred: v.count > 0 ? ((v.sum / v.count) / 100) : 0,
    })).sort((a: any, b: any) => (b?.avg_preferred ?? 0) - (a?.avg_preferred ?? 0));

    // Top/bottom countries for lollipop
    const ranked = currentMetrics
      .map((m: any) => ({
        country: m.country?.name ?? m.cc,
        preferred: Number(m.preferredPc ?? 0) / 100,
        region: m.country?.subRegion ?? 'Unknown',
      }))
      .sort((a: any, b: any) => (b?.preferred ?? 0) - (a?.preferred ?? 0));

    const topBottom = [
      ...ranked.slice(0, 10),
      ...ranked.slice(-5),
    ];

    // Fast movers (highest 30d change)
    const movers = currentMetrics
      .map((m: any) => {
        const old = oldMap.get(m.cc);
        return {
          country: m.country?.name ?? m.cc,
          change: old !== undefined ? ((Number(m.preferredPc ?? 0) - old) / 100) : 0,
          region: m.country?.subRegion ?? 'Unknown',
        };
      })
      .sort((a: any, b: any) => (b?.change ?? 0) - (a?.change ?? 0))
      .slice(0, 10);

    // Country table
    const allocations = await prisma.afrinicAllocation.findMany({
      orderBy: { date: 'desc' },
      distinct: ['cc'],
    });
    const allocMap = new Map(allocations.map((a: any) => [a.cc, Number(a.total32s ?? 0)]));

    const tableData = currentMetrics.map((m: any) => {
      const old = oldMap.get(m.cc);
      return {
        country: m.country?.name ?? m.cc,
        cc: m.cc,
        region: m.country?.subRegion ?? 'Unknown',
        testbed: m.country?.isTestbed ? 'Testbed' : '',
        preferred: Number(m.preferredPc ?? 0) / 100,
        capable: Number(m.capablePc ?? 0) / 100,
        alloc_32s: allocMap.get(m.cc) ?? 0,
        change_30d: old !== undefined ? ((Number(m.preferredPc ?? 0) - old) / 100) : 0,
      };
    }).sort((a: any, b: any) => (b?.preferred ?? 0) - (a?.preferred ?? 0));

    const kpis = [
      {
        label: 'Africa IPv6 Preferred',
        value: avgPreferred / 100,
        format: 'percent',
        delta: avgChange / 100,
        delta_label: '30d',
        good_when: 'up',
        metric: 'avg_preferred',
        region: 'All',
      },
      {
        label: 'Africa IPv6 Capable',
        value: avgCapable / 100,
        format: 'percent',
        delta: null,
        delta_label: '',
        good_when: 'up',
        metric: 'avg_capable',
        region: 'All',
      },
      {
        label: 'Countries Above 10%',
        value: above10,
        format: 'integer',
        delta: null,
        delta_label: '',
        good_when: 'up',
        metric: 'above_10',
        region: 'All',
      },
      {
        label: 'Countries Tracked',
        value: total,
        format: 'integer',
        delta: null,
        delta_label: '',
        good_when: 'up',
        metric: 'total',
        region: 'All',
      },
    ];

    return NextResponse.json({
      data_as_of: currentDate.toISOString(),
      data: {
        kpis,
        trend: trendData,
        regions: regionData,
        rankings: topBottom,
        movers,
        country_table: tableData,
      },
    });
  } catch (e: any) {
    console.error('Dashboard API error:', e);
    return NextResponse.json({
      data_as_of: new Date().toISOString(),
      data: { kpis: [], trend: [], regions: [], rankings: [], movers: [], country_table: [] },
    });
  }
}
