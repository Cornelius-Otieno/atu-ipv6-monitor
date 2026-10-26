'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { useRouter } from 'next/navigation';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

// ISO numeric -> ISO alpha-2
const NUMERIC_TO_ALPHA2: Record<string, string> = {
  '012': 'DZ', '024': 'AO', '204': 'BJ', '072': 'BW', '854': 'BF',
  '108': 'BI', '120': 'CM', '132': 'CV', '140': 'CF', '148': 'TD',
  '174': 'KM', '178': 'CG', '180': 'CD', '384': 'CI', '262': 'DJ',
  '818': 'EG', '226': 'GQ', '232': 'ER', '748': 'SZ', '231': 'ET',
  '266': 'GA', '270': 'GM', '288': 'GH', '324': 'GN', '624': 'GW',
  '404': 'KE', '426': 'LS', '430': 'LR', '434': 'LY', '450': 'MG',
  '454': 'MW', '466': 'ML', '478': 'MR', '480': 'MU', '504': 'MA',
  '508': 'MZ', '516': 'NA', '562': 'NE', '566': 'NG', '646': 'RW',
  '678': 'ST', '686': 'SN', '690': 'SC', '694': 'SL', '706': 'SO',
  '710': 'ZA', '728': 'SS', '729': 'SD', '834': 'TZ', '768': 'TG',
  '788': 'TN', '800': 'UG', '894': 'ZM', '716': 'ZW',
};

const AFRICAN_NUMERICS = new Set(Object.keys(NUMERIC_TO_ALPHA2));

function getColor(value: number): string {
  if (value >= 30) return '#0B4D27';
  if (value >= 20) return '#157A3C';
  if (value >= 10) return '#2E9D5B';
  if (value >= 5) return '#6FC08A';
  if (value >= 1) return '#A8D7BC';
  if (value > 0) return '#D4EFDE';
  return '#EAF1EC';
}

interface AfricaMapProps {
  countries: Array<{
    cc: string;
    name: string;
    preferredPc: number;
    capablePc: number;
    change30d: number | null;
  }>;
}

export default function AfricaMap({ countries }: AfricaMapProps) {
  const router = useRouter();
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  const countryMap = useMemo(() => {
    const map = new Map<string, any>();
    for (const c of countries ?? []) {
      map.set(c?.cc, c);
    }
    return map;
  }, [countries]);

  return (
    <div className="relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [20, 2],
          scale: 400,
        }}
        width={800}
        height={600}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }: any) =>
            (geographies ?? []).map((geo: any) => {
              const numericId = geo?.id ?? geo?.properties?.['ISO_A3_N'] ?? '';
              if (!AFRICAN_NUMERICS.has(numericId)) return null;

              const alpha2 = NUMERIC_TO_ALPHA2[numericId] ?? '';
              const countryData = countryMap.get(alpha2);
              const value = countryData?.preferredPc ?? 0;

              return (
                <Geography
                  key={geo?.rsmKey ?? numericId}
                  geography={geo}
                  fill={getColor(value)}
                  stroke="#fff"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#F5A623', cursor: 'pointer' },
                    pressed: { outline: 'none' },
                  } as any}
                  onMouseEnter={(evt: any) => {
                    const name = countryData?.name ?? geo?.properties?.name ?? alpha2;
                    setTooltip({
                      x: evt?.clientX ?? 0,
                      y: evt?.clientY ?? 0,
                      content: `${name}: ${value.toFixed(2)}% preferred`,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={() => {
                    if (alpha2) router.push(`/country/${alpha2.toLowerCase()}`);
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur p-3 rounded-md shadow text-xs">
        <p className="font-semibold mb-1">IPv6 Preferred %</p>
        <div className="flex items-center gap-1">
          {[0, 1, 5, 10, 20, 30].map((v: number) => (
            <div key={v} className="flex flex-col items-center">
              <div className="w-5 h-3 rounded-sm" style={{ backgroundColor: getColor(v) }} />
              <span className="mt-0.5">{v}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-[100] bg-[#0E3B1E] text-white text-xs px-3 py-1.5 rounded-md shadow-lg pointer-events-none"
          style={{ left: tooltip.x + 10, top: tooltip.y - 30 }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
