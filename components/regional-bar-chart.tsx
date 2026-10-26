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
  countries: Array<{ cc: string; name: string; preferredPc: number }>;
}

export default function RegionalBarChart({ countries }: Props) {
  const data = (countries ?? []).map((c: any) => ({
    name: c?.name ?? c?.cc ?? '',
    preferred: c?.preferredPc ?? 0,
  }));

  if (data?.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No data available.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 30)}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
        <XAxis
          type="number"
          tickLine={false}
          tick={{ fontSize: 10 }}
          label={{ value: 'Preferred %', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fontSize: 11 } }}
        />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          tick={{ fontSize: 10 }}
          width={90}
        />
        <Tooltip contentStyle={{ fontSize: 11 }} />
        <Bar dataKey="preferred" fill="#157A3C" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
