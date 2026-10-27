'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';

interface Props {
  timeSeries: Array<{ date: string; preferredPc: number; capablePc: number; dailySampleN?: number }>;
}

export default function CountryTimeSeries({ timeSeries }: Props) {
  if ((timeSeries?.length ?? 0) === 0) {
    return <p className="text-center text-muted-foreground py-8">No time series data available yet. Run the ETL to populate data.</p>;
  }

  const hasSamples = timeSeries.some((point) => Number(point.dailySampleN ?? 0) > 0);
  const sampleSeries = timeSeries.map((point) => ({ ...point, samples: point.dailySampleN ?? 0 }));

  return (
    <div className="space-y-5">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={timeSeries} margin={{ top: 8, right: 20, left: 10, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d9e2dc" />
          <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 10 }} minTickGap={36} />
          <YAxis tickLine={false} tick={{ fontSize: 10 }} domain={[0, 'auto']} unit="%" />
          <Tooltip contentStyle={{ fontSize: 11 }} />
          <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="preferredPc" name="IPv6 Preference" stroke="#E4512B" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="capablePc" name="IPv6 Capable" stroke="#2878D0" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      {hasSamples && (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={sampleSeries} margin={{ top: 4, right: 20, left: 10, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d9e2dc" />
            <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 10 }} minTickGap={36} />
            <YAxis tickLine={false} tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="samples" name="Sample Count" stroke="#2878D0" fill="#2878D0" fillOpacity={0.16} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
