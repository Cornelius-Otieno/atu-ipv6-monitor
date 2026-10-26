'use client';

import { useEffect, useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SUB_REGIONS } from '@/lib/countries';
import dynamic from 'next/dynamic';

const RegionalBarChart = dynamic(() => import('@/components/regional-bar-chart'), {
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full" />,
});

interface RegionData {
  name: string;
  avgPreferred: number;
  avgCapable: number;
  countryCount: number;
  countries: Array<{ cc: string; name: string; isTestbed: boolean; preferredPc: number; capablePc: number }>;
}

export default function RegionalPage() {
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/regional')
      .then((r: any) => r.json())
      .then((d: any) => setRegions(d?.regions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <div className="flex items-center gap-2 mb-2">
        <MapIcon className="h-6 w-6 text-[#157A3C]" />
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Regional View</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        IPv6 adoption breakdown by Africa&apos;s five sub-regions.
      </p>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <Tabs defaultValue={regions?.[0]?.name ?? SUB_REGIONS[0]}>
          <TabsList className="flex flex-wrap gap-1 mb-4 h-auto">
            {regions.map((r: RegionData) => (
              <TabsTrigger key={r.name} value={r.name} className="text-xs sm:text-sm">
                {r.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {regions.map((r: RegionData) => (
            <TabsContent key={r.name} value={r.name}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-xs text-muted-foreground">Avg Preferred %</p>
                    <p className="font-mono text-2xl font-bold text-[#157A3C]">{r.avgPreferred?.toFixed?.(2)}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-xs text-muted-foreground">Avg Capable %</p>
                    <p className="font-mono text-2xl font-bold text-[#009B4E]">{r.avgCapable?.toFixed?.(2)}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <p className="text-xs text-muted-foreground">Countries</p>
                    <p className="font-mono text-2xl font-bold">{r.countryCount}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Countries in {r.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <RegionalBarChart countries={r.countries ?? []} />
                </CardContent>
              </Card>

              {/* Country table */}
              <Card className="mt-4">
                <CardContent className="pt-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">Country</th>
                          <th className="text-right py-2 px-2">Preferred %</th>
                          <th className="text-right py-2 px-2">Capable %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(r.countries ?? []).map((c: any) => (
                          <tr key={c.cc} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-2">
                              {c.name}
                              {c.isTestbed && (
                                <span className="ml-1 text-xs bg-[#157A3C]/10 text-[#157A3C] px-1 rounded">🔬</span>
                              )}
                            </td>
                            <td className="text-right py-2 px-2 font-mono">{c.preferredPc?.toFixed?.(2)}%</td>
                            <td className="text-right py-2 px-2 font-mono">{c.capablePc?.toFixed?.(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
