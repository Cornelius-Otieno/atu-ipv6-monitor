'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface Props {
  data: Array<{ cc: string; name: string; total32s: number }>;
}

export default function AllocBarChart({ data }: Props) {
  const chartData = (data ?? []).map((d: any) => ({
    name: d?.name ?? d?.cc ?? '',
    total32s: d?.total32s ?? 0,
  }));

  if (chartData?.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No allocation data available.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(400, chartData.length * 25)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
        <XAxis
          type="number"
          tickLine={false}
          tick={{ fontSize: 10 }}
          label={{ value: '/32 Equiv', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fontSize: 11 } }}
        />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          tick={{ fontSize: 10 }}
          width={90}
        />
        <Tooltip contentStyle={{ fontSize: 11 }} />
        <Bar dataKey="total32s" fill="#009B4E" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
