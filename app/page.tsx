'use client';

import { AbacusDashboard, useDashboardData } from '@/components/viz/abacus-dashboard';
import { manifest } from '@/lib/dashboard-manifest';
import { AfricaMapSection } from '@/components/africa-map-section';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { data, dataAsOf, error } = useDashboardData('/api/dashboard', 120_000);

  return (
    <div>
      {/* Interactive map section */}
      <AfricaMapSection />

      {/* Dashboard kit section */}
      <div className="mt-2">
        {error ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Unable to load dashboard data. Please try again later.</p>
          </div>
        ) : !data ? (
          <div className="px-4 py-12 max-w-[1200px] mx-auto space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <AbacusDashboard manifest={manifest} data={data} dataAsOf={dataAsOf} className="min-h-[600px]" />
        )}
      </div>
    </div>
  );
}
