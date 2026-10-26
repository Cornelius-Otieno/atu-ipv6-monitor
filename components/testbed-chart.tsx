'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { useMemo } from 'react';

const COLORS = ['#157A3C', '#009B4E', '#D4880F', '#CC3333', '#6B5FA3', '#2E8B7A'];

interface Props {
  countries: Array<{
    cc: string;
    name: string;
    timeSeries: Array<{ date: string; preferredPc: number }>;
  }>;
}

export default function TestbedChart({ countries }: Props) {
  const chartData = useMemo(() => {
    const dateMap = new Map<string, Record<string, number>>();
    for (const c of countries ?? []) {
      for (const point of c?.timeSeries ?? []) {
        if (!dateMap.has(point.date)) dateMap.set(point.date, {});
        const entry = dateMap.get(point.date)!;
        entry[c.cc] = point.preferredPc;
      }
    }
    return Array.from(dateMap.entries())
      .map(([date, values]: [string, Record<string, number>]) => ({ date, ...values }))
      .sort((a: any, b: any) => (a?.date ?? '').localeCompare(b?.date ?? ''));
  }, [countries]);

  if (chartData?.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No time series data available yet. Run the ETL to populate data.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
        <XAxis
          dataKey="date"
          tickLine={false}
          tick={{ fontSize: 10 }}
          interval="preserveStartEnd"
          label={{ value: 'Date', position: 'insideBottom', offset: -15, style: { textAnchor: 'middle', fontSize: 11 } }}
        />
        <YAxis
          tickLine={false}
          tick={{ fontSize: 10 }}
          label={{ value: 'Preferred %', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11 } }}
        />
        <Tooltip contentStyle={{ fontSize: 11 }} />
        <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
        {(countries ?? []).map((c: any, i: number) => (
          <Line
            key={c.cc}
            type="monotone"
            dataKey={c.cc}
            name={c.name}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
