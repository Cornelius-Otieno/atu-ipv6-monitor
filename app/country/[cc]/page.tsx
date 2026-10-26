'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Globe, Zap, Database, Users, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getFlagEmoji, getStatusInfo } from '@/lib/countries';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const CountryTimeSeries = dynamic(() => import('@/components/country-time-series'), {
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full" />,
});

export default function CountryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cc = ((params?.cc as string) ?? '').toUpperCase();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cc) return;
    fetch(`/api/country/${cc}`)
      .then((r: any) => r.json())
      .then((d: any) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cc]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_: any, i: number) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (!data?.country) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-16 text-center">
        <p className="text-muted-foreground">Country not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/')}>Back to Overview</Button>
      </div>
    );
  }

  const country = data.country;
  const latest = data.latest;
  const status = getStatusInfo(latest?.preferredPc);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <Button variant="ghost" size="sm" className="mb-4 gap-1" onClick={() => router.push('/')}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">{getFlagEmoji(cc)}</span>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{country.name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{country.subRegion}</span>
            {country.isTestbed && (
              <span className="bg-[#157A3C]/10 text-[#157A3C] text-xs font-medium px-2 py-0.5 rounded-full">
                🔬 Testbed
              </span>
            )}
            <span className={cn('flex items-center gap-1', status.color)}>
              {status.emoji} {status.label}
            </span>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard icon={Globe} label="Preferred %" value={latest?.preferredPc} suffix="%" color="text-[#157A3C]" />
        <MetricCard icon={Zap} label="Capable %" value={latest?.capablePc} suffix="%" color="text-[#009B4E]" />
        <MetricCard icon={Database} label="Allocations" value={data?.allocation?.total32s} suffix=" /32s" color="text-[#F5A623]" />
        <MetricCard icon={Users} label="Sample Size" value={latest?.sampleN} suffix="" color="text-foreground" />
      </div>

      {/* Time series chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">IPv6 Adoption Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <CountryTimeSeries timeSeries={data?.timeSeries ?? []} />
        </CardContent>
      </Card>

      {/* Cloudflare card */}
      {data?.cloudflare && (
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cloudflare Radar IPv6 Traffic</p>
                <p className="font-mono text-xl font-bold text-[#F5A623]">{data.cloudflare.ipv6TrafficPct?.toFixed?.(2)}%</p>
              </div>
              <p className="text-xs text-muted-foreground">As of {data.cloudflare.date}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ASN table */}
      {(data?.asnMetrics?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top ASNs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">ASN</th>
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-right py-2 px-2">Preferred %</th>
                    <th className="text-right py-2 px-2">Capable %</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.asnMetrics ?? []).map((a: any, i: number) => (
                    <tr key={`${a.asn}-${i}`} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2 font-mono">{a.asn}</td>
                      <td className="py-2 px-2">{a.asnName}</td>
                      <td className="text-right py-2 px-2 font-mono">{a.preferredPc?.toFixed?.(2)}%</td>
                      <td className="text-right py-2 px-2 font-mono">{a.capablePc?.toFixed?.(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  suffix,
  color,
}: {
  icon: any;
  label: string;
  value: number | undefined | null;
  suffix: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Icon className={cn('h-4 w-4', color)} />
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p className={cn('font-mono text-2xl font-bold', color)}>
          {value != null ? (typeof value === 'number' ? value.toFixed(2) : value) : 'N/A'}
          {value != null && <span className="text-sm font-normal text-muted-foreground">{suffix}</span>}
        </p>
      </CardContent>
    </Card>
  );
}
