export const APNIC_AFRICA = { name: 'Africa', code: 'XB' } as const;

export const APNIC_REGIONS = [
  { name: 'North Africa', code: 'XJ' },
  { name: 'West Africa', code: 'XL' },
  { name: 'East Africa', code: 'XH' },
  { name: 'Central Africa', code: 'XI' },
  { name: 'Southern Africa', code: 'XK' },
] as const;

export interface ApnicSeriesPoint {
  date: string;
  preferredPc: number;
  capablePc: number;
  dailySampleN: number;
}

export async function fetchApnicRegionSeries() {
  const entries = await Promise.all([APNIC_AFRICA, ...APNIC_REGIONS].map(async ({ name, code }) => {
    try {
      const response = await fetch(`https://data1.labs.apnic.net/v6stats/v6region/${code}.json`, {
        next: { revalidate: 3600 },
      });
      if (!response.ok) return [name, []] as const;

      const payload = await response.json();
      const points: ApnicSeriesPoint[] = (payload?.data ?? []).flatMap((row: any) => {
        const interval = row?.['30'];
        if (!row?.date || !interval) return [];
        return [{
          date: row.date,
          preferredPc: Number(interval.preferred_pc ?? 0),
          capablePc: Number(interval.capable_pc ?? 0),
          dailySampleN: Math.round(Number(row.raw?.seen ?? 0)),
        }];
      });
      return [name, points] as const;
    } catch {
      return [name, []] as const;
    }
  }));

  return Object.fromEntries(entries) as Record<string, ApnicSeriesPoint[]>;
}

export interface ApnicRegionSummary {
  preferredPc: number;
  capablePc: number;
  sampleN: number;
  weight: number;
  weightedSamples: number;
}

export interface ApnicCountrySummary extends ApnicRegionSummary {
  cc: string;
}

export async function fetchApnicCountrySummaries() {
  try {
    const response = await fetch('https://stats.labs.apnic.net/ipv6/XB', {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return {} as Record<string, ApnicCountrySummary>;

    const html = await response.text();
    const tableStart = html.indexOf("['CC', 'Country'");
    const tableEnd = tableStart >= 0 ? html.indexOf(']);', tableStart) : -1;
    if (tableStart < 0 || tableEnd < 0) return {} as Record<string, ApnicCountrySummary>;

    const rows = html.slice(tableStart, tableEnd).split(/\r?\n/);
    const summaries: Record<string, ApnicCountrySummary> = {};
    for (const row of rows) {
      const code = row.match(/\/ipv6\/([A-Z]{2})\?[^\"]*">\1<\/a>/)?.[1];
      const values = row.match(/\{v:\s*([\d.]+),\s*f:'[\d.]+%'\}\s*,\s*\{v:\s*([\d.]+),\s*f:\s*'[\d.]+%'\}\s*,\s*(\d+),\s*([\d.]+),\s*(\d+)\s*\]/);
      if (!code || !values) continue;

      summaries[code] = {
        cc: code,
        capablePc: Number(values[1]),
        preferredPc: Number(values[2]),
        sampleN: Number(values[3]),
        weight: Number(values[4]),
        weightedSamples: Number(values[5]),
      };
    }

    return summaries;
  } catch {
    return {} as Record<string, ApnicCountrySummary>;
  }
}

export async function fetchApnicRegionSummaries() {
  try {
    const response = await fetch('https://stats.labs.apnic.net/ipv6/XB', {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return {} as Record<string, ApnicRegionSummary>;

    const html = await response.text();
    const summaries: Record<string, ApnicRegionSummary> = {};
    const parseRow = (tableHeader: string, code: string) => {
      const tableStart = html.indexOf(tableHeader);
      const tableEnd = tableStart >= 0 ? html.indexOf(']);', tableStart) : -1;
      if (tableStart < 0 || tableEnd < 0) return null;

      const tableRows = html.slice(tableStart, tableEnd).split(/\r?\n/);
      const row = tableRows.find((line) => line.includes(`>${code}</a>`));
      const values = row?.match(/\{v:\s*([\d.]+),\s*f:'[\d.]+%'\}\s*,\s*\{v:\s*([\d.]+),\s*f:\s*'[\d.]+%'\}\s*,\s*(\d+),\s*([\d.]+),\s*(\d+)\s*\]/);
      if (!values) return null;

      return {
        capablePc: Number(values[1]),
        preferredPc: Number(values[2]),
        sampleN: Number(values[3]),
        weight: Number(values[4]),
        weightedSamples: Number(values[5]),
      } satisfies ApnicRegionSummary;
    };

    const africa = parseRow("['Code', 'Region'", APNIC_AFRICA.code);
    if (africa) summaries[APNIC_AFRICA.name] = africa;

    for (const { name, code } of APNIC_REGIONS) {
      const summary = parseRow("['Code', 'SubRegion'", code);
      if (summary) summaries[name] = summary;
    }

    return summaries;
  } catch {
    return {} as Record<string, ApnicRegionSummary>;
  }
}