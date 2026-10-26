'use client';

import { useEffect, useState } from 'react';
import { Database, Download, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { exportToExcel } from '@/lib/excel-export';
import dynamic from 'next/dynamic';

const AllocBarChart = dynamic(() => import('@/components/alloc-bar-chart'), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full" />,
});

interface AllocData {
  cc: string;
  name: string;
  subRegion: string;
  isTestbed: boolean;
  allocationCount: number;
  total32s: number;
  allocationDate: string;
  preferredPc: number;
  adoptionGap: boolean;
}

export default function AllocationsPage() {
  const [data, setData] = useState<AllocData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/allocations')
      .then((r: any) => r.json())
      .then((d: any) => setData(d?.allocations ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    exportToExcel(data, 'ATU-IPv6-Allocations');
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-[#157A3C]" />
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">AFRINIC Allocations</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            IPv6 address space allocated to African countries by AFRINIC.
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm" className="gap-2" disabled={data?.length === 0}>
          <Download className="h-4 w-4" /> Export Excel
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-[400px] w-full" />
      ) : (
        <>
          {/* Top 20 bar chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Top 20 by IPv6 Space Allocated (/32 equivalents)</CardTitle>
            </CardHeader>
            <CardContent>
              <AllocBarChart data={data.slice(0, 20)} />
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Country</th>
                      <th className="text-left py-2 px-2">Region</th>
                      <th className="text-right py-2 px-2">Allocations</th>
                      <th className="text-right py-2 px-2">/32 Equiv</th>
                      <th className="text-right py-2 px-2">Preferred %</th>
                      <th className="text-center py-2 px-2">Gap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((a: AllocData) => (
                      <tr key={a.cc} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2">
                          {a.name}
                          {a.isTestbed && (
                            <span className="ml-1 text-xs bg-[#157A3C]/10 text-[#157A3C] px-1 rounded">🔬</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-muted-foreground">{a.subRegion}</td>
                        <td className="text-right py-2 px-2 font-mono">{a.allocationCount}</td>
                        <td className="text-right py-2 px-2 font-mono">{a.total32s?.toFixed?.(0)}</td>
                        <td className="text-right py-2 px-2 font-mono">{a.preferredPc?.toFixed?.(2)}%</td>
                        <td className="text-center py-2 px-2">
                          {a.adoptionGap && (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                              <AlertTriangle className="h-3 w-3" /> Gap
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
