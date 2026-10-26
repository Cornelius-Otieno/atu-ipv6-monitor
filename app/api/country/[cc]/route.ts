export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cc: string }> }
) {
  try {
    const { cc } = await params;
    const upperCc = cc?.toUpperCase?.() ?? '';

    const country = await prisma.country.findUnique({ where: { cc: upperCc } });
    if (!country) {
      return NextResponse.json({ error: 'Country not found' }, { status: 404 });
    }

    // Get all time series metrics
    const metrics = await prisma.countryMetric.findMany({
      where: { cc: upperCc },
      orderBy: { date: 'asc' },
    });

    // Get latest AFRINIC allocations
    const alloc = await prisma.afrinicAllocation.findFirst({
      where: { cc: upperCc },
      orderBy: { date: 'desc' },
    });

    // Get latest Cloudflare metrics
    const cf = await prisma.cloudflareMetric.findFirst({
      where: { cc: upperCc },
      orderBy: { date: 'desc' },
    });

    // Get ASN metrics
    const asnMetrics = await prisma.asnMetric.findMany({
      where: { cc: upperCc },
      orderBy: { date: 'desc' },
      take: 50,
      distinct: ['asn'],
    });

    const latest = metrics?.[metrics.length - 1] ?? null;
    const serialized = {
      ...country,
      population: country.population ? String(country.population) : null,
      internetUsers: country.internetUsers ? String(country.internetUsers) : null,
    };

    return NextResponse.json({
      country: serialized,
      latest: latest ? {
        preferredPc: Number(latest.preferredPc ?? 0),
        capablePc: Number(latest.capablePc ?? 0),
        sampleN: latest.sampleN ?? 0,
        date: latest.date?.toISOString?.() ?? null,
      } : null,
      timeSeries: metrics.map((m: any) => ({
        date: m.date?.toISOString?.()?.split?.('T')?.[0] ?? '',
        preferredPc: Number(m.preferredPc ?? 0),
        capablePc: Number(m.capablePc ?? 0),
        sampleN: m.sampleN ?? 0,
      })),
      allocation: alloc ? {
        allocationCount: alloc.allocationCount,
        total32s: Number(alloc.total32s),
        date: alloc.date?.toISOString?.()?.split?.('T')?.[0] ?? '',
      } : null,
      cloudflare: cf ? {
        ipv6TrafficPct: Number(cf.ipv6TrafficPct ?? 0),
        date: cf.date?.toISOString?.()?.split?.('T')?.[0] ?? '',
      } : null,
      asnMetrics: asnMetrics.map((a: any) => ({
        asn: a.asn,
        asnName: a.asnName ?? `AS${a.asn}`,
        preferredPc: Number(a.preferredPc ?? 0),
        capablePc: Number(a.capablePc ?? 0),
      })),
    });
  } catch (e: any) {
    console.error('Country API error:', e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
