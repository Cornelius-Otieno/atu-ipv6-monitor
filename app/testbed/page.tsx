'use client';

import { useEffect, useState } from 'react';
import { FlaskConical, TrendingUp, TrendingDown, Download, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getFlagEmoji, getStatusInfo } from '@/lib/countries';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const TestbedChart = dynamic(() => import('@/components/testbed-chart'), {
  ssr: false,
  loading: () => <Skeleton className="h-[350px] w-full" />,
});

interface TestbedCountry {
  cc: string;
  name: string;
  subRegion: string | null;
  preferredPc: number;
  capablePc: number;
  allocations32s: number;
  cloudflareTrafficPct: number | null;
  change30d: number | null;
  change90d: number | null;
  timeSeries: Array<{ date: string; preferredPc: number; capablePc: number }>;
}

export default function TestbedPage() {
  const [countries, setCountries] = useState<TestbedCountry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/testbed')
      .then((r: any) => r.json())
      .then((d: any) => setCountries(d?.countries ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleExportPDF = () => {
    window?.print?.();
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-[#157A3C]" />
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
              ATU IPv6 Testbed Programme
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitoring the 6 pilot countries driving IPv6 deployment across Africa.
          </p>
        </div>
        <Button onClick={handleExportPDF} variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Export PDF
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_: any, i: number) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <>
          {/* Country cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {countries.map((c: TestbedCountry) => {
              const status = getStatusInfo(c.preferredPc);
              return (
                <Card key={c.cc} className="border-l-4 border-l-[#157A3C] hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="text-xl">{getFlagEmoji(c.cc)}</span>
                        {c.name}
                      </CardTitle>
                      <span className="inline-flex items-center gap-1 bg-[#157A3C]/10 text-[#157A3C] text-xs font-medium px-2 py-0.5 rounded-full">
                        <FlaskConical className="h-3 w-3" /> Testbed
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.subRegion}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-end gap-2">
                      <span className="font-mono text-3xl font-bold text-[#157A3C]">
                        {c.preferredPc?.toFixed?.(2) ?? '0.00'}
                      </span>
                      <span className="text-sm text-muted-foreground mb-1">% preferred</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Capable</span>
                        <p className="font-mono font-semibold">{c.capablePc?.toFixed?.(2) ?? '0'}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Allocations</span>
                        <p className="font-mono font-semibold">{c.allocations32s?.toFixed?.(0) ?? '0'} /32s</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">30d Change</span>
                        <p className={cn('font-mono font-semibold flex items-center gap-1',
                          (c.change30d ?? 0) > 0 ? 'text-green-600' : (c.change30d ?? 0) < 0 ? 'text-red-600' : ''
                        )}>
                          {(c.change30d ?? 0) > 0 ? <TrendingUp className="h-3 w-3" /> :
                            (c.change30d ?? 0) < 0 ? <TrendingDown className="h-3 w-3" /> :
                            <Minus className="h-3 w-3" />}
                          {c.change30d !== null ? `${c.change30d > 0 ? '+' : ''}${c.change30d.toFixed(2)} pp` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">CF Traffic</span>
                        <p className="font-mono font-semibold">{c.cloudflareTrafficPct !== null ? `${c.cloudflareTrafficPct.toFixed(2)}%` : 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <span>{status.emoji}</span>
                      <span className={status.color}>{status.label}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Comparison chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Testbed Country Comparison</CardTitle>
              <p className="text-sm text-muted-foreground">IPv6 Preferred % over time for all testbed countries</p>
            </CardHeader>
            <CardContent>
              <TestbedChart countries={countries} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
