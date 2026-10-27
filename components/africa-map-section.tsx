'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, TrendingUp, Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const AfricaMap = dynamic(() => import('@/components/africa-map'), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full rounded-lg" />,
});

interface OverviewData {
  countries: any[];
  kpis: {
    avgPreferred: number;
    avgCapable: number;
    above10: number;
    avgChange30d: number;
    totalCountries: number;
  };
  lastUpdated: string | null;
}

export function AfricaMapSection() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/overview')
      .then((r: any) => r.json())
      .then((d: any) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = data?.kpis;

  return (
    <section className="hero-gradient">
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        {/* Hero title */}
        <div className="text-center mb-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Africa IPv6 <span className="text-[#157A3C]">Adoption</span> Monitor
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
            Tracking IPv6 deployment across 54 African countries with real-time data from APNIC Labs, AFRINIC, and Cloudflare Radar.
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard
            icon={Globe}
            label="Africa Preferred %"
            value={kpis?.avgPreferred}
            suffix="%"
            loading={loading}
            color="text-[#157A3C]"
          />
          <KpiCard
            icon={Zap}
            label="Capable %"
            value={kpis?.avgCapable}
            suffix="%"
            loading={loading}
            color="text-[#009B4E]"
          />
          <KpiCard
            icon={TrendingUp}
            label="Above 10%"
            value={kpis?.above10}
            suffix=" countries"
            loading={loading}
            color="text-[#F5A623]"
          />
          <KpiCard
            icon={Users}
            label="30d Change"
            value={kpis?.avgChange30d}
            suffix=" pp"
            loading={loading}
            color="text-[#009B4E]"
            showSign
          />
        </div>

        {/* Map */}
        <div className="bg-card rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold">IPv6 Preferred % by Country · APNIC 30-day</h2>
            {data?.lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Last updated: {new Date(data.lastUpdated).toLocaleDateString('en-US', { timeZone: 'UTC' })}
              </span>
            )}
          </div>
          {loading ? (
            <Skeleton className="h-[400px] w-full rounded-lg" />
          ) : (
            <AfricaMap countries={data?.countries ?? []} />
          )}
        </div>
      </div>
    </section>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  suffix,
  loading,
  color,
  showSign,
}: {
  icon: any;
  label: string;
  value: number | undefined;
  suffix: string;
  loading: boolean;
  color: string;
  showSign?: boolean;
}) {
  return (
    <div className="bg-card rounded-lg shadow-sm p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className={cn('h-4 w-4', color)} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-20 mt-1" />
      ) : (
        <p className={cn('font-mono text-2xl font-bold', color)}>
          {showSign && (value ?? 0) > 0 ? '+' : ''}
          {value?.toFixed?.(2) ?? '0'}
          <span className="text-sm font-normal text-muted-foreground">{suffix}</span>
        </p>
      )}
    </div>
  );
}
