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

interface Props {
  timeSeries: Array<{ date: string; preferredPc: number; capablePc: number }>;
}

export default function CountryTimeSeries({ timeSeries }: Props) {
  if ((timeSeries?.length ?? 0) === 0) {
    return <p className="text-center text-muted-foreground py-8">No time series data available yet. Run the ETL to populate data.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={timeSeries} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
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
          label={{ value: '%', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11 } }}
        />
        <Tooltip contentStyle={{ fontSize: 11 }} />
        <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="preferredPc" name="Preferred %" stroke="#157A3C" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="capablePc" name="Capable %" stroke="#009B4E" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
