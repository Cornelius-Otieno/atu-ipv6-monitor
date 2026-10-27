import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const AFRICAN_CCS = [
  'DZ','AO','BJ','BW','BF','BI','CM','CV','CF','TD','KM','CG','CD','CI','DJ',
  'EG','GQ','ER','SZ','ET','GA','GM','GH','GN','GW','KE','LS','LR','LY','MG',
  'MW','ML','MR','MU','MA','MZ','NA','NE','NG','RW','ST','SN','SC','SL','SO',
  'ZA','SS','SD','TZ','TG','TN','UG','ZM','ZW',
];

const CONCURRENCY = 6;
const INSERT_BATCH_SIZE = 1000;

type MetricRow = {
  date: Date;
  cc: string;
  preferredPc: number;
  capablePc: number;
  sampleN: number;
  dailySampleN: number;
  source: string;
};

async function fetchCountryHistory(cc: string): Promise<MetricRow[]> {
  const response = await fetch(`https://data1.labs.apnic.net/v6stats/v6economy/${cc}.json`, {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`${cc}: HTTP ${response.status}`);

  const payload = await response.json();
  const rows = payload?.data;
  if (!Array.isArray(rows)) throw new Error(`${cc}: invalid APNIC response`);

  return rows.flatMap((row: any) => {
    const interval = row?.['30'];
    if (!row?.date || !interval) return [];

    const date = new Date(`${row.date}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) return [];

    return [{
      date,
      cc,
      preferredPc: Number(interval.preferred_pc ?? 0),
      capablePc: Number(interval.capable_pc ?? 0),
      sampleN: Math.round(Number(interval.seen ?? 0) * 30),
      dailySampleN: Math.round(Number(row.raw?.seen ?? 0)),
      source: 'APNIC',
    }];
  });
}

async function insertCountryHistory(cc: string, rows: MetricRow[]) {
  await prisma.countryMetric.deleteMany({ where: { cc, source: 'APNIC' } });
  for (let start = 0; start < rows.length; start += INSERT_BATCH_SIZE) {
    await prisma.countryMetric.createMany({
      data: rows.slice(start, start + INSERT_BATCH_SIZE),
      skipDuplicates: true,
    });
  }
}

async function main() {
  const histories = new Map<string, MetricRow[]>();

  for (let start = 0; start < AFRICAN_CCS.length; start += CONCURRENCY) {
    const batch = AFRICAN_CCS.slice(start, start + CONCURRENCY);
    const results = await Promise.all(batch.map(async (cc) => ({ cc, rows: await fetchCountryHistory(cc) })));
    for (const result of results) histories.set(result.cc, result.rows);
  }

  for (const cc of AFRICAN_CCS) {
    const rows = histories.get(cc) ?? [];
    if (rows.length === 0) throw new Error(`${cc}: no valid APNIC 30-day history`);
  }

  let totalRows = 0;
  for (const cc of AFRICAN_CCS) {
    const rows = histories.get(cc) ?? [];
    await insertCountryHistory(cc, rows);
    totalRows += rows.length;
    console.log(`${cc}: imported ${rows.length} APNIC 30-day points`);
  }

  console.log(`Imported ${totalRows} rows across ${AFRICAN_CCS.length} countries.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });