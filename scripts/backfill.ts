/**
 * Backfill script: fetches the latest APNIC 30-day values for all 54 countries.
 *
 * Usage: cd nextjs_space && yarn tsx --require dotenv/config scripts/backfill.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const AFRICAN_CCS = [
  'DZ','AO','BJ','BW','BF','BI','CM','CV','CF','TD','KM','CG','CD','CI','DJ',
  'EG','GQ','ER','SZ','ET','GA','GM','GH','GN','GW','KE','LS','LR','LY','MG',
  'MW','ML','MR','MU','MA','MZ','NA','NE','NG','RW','ST','SN','SC','SL','SO',
  'ZA','SS','SD','TZ','TG','TN','UG','ZM','ZW'
];

async function main() {
  let updated = 0;
  let errors = 0;

  console.log(`Backfilling APNIC data for ${AFRICAN_CCS.length} countries...`);

  for (const cc of AFRICAN_CCS) {
    try {
      const url = `https://data1.labs.apnic.net/v6stats/v6economy/${cc}.json`;
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) {
        console.error(`  ${cc}: HTTP ${res.status}`);
        errors++;
        continue;
      }
      const data = await res.json();
      const rows = data?.data ?? [];
      if (!Array.isArray(rows) || rows.length === 0) {
        console.error(`  ${cc}: no data`);
        errors++;
        continue;
      }

      // APNIC's default chart interval is 30 days.
      const row = rows[rows.length - 1];
      const interval = row?.['30'];
      if (!row?.date || !interval) {
        console.error(`  ${cc}: latest row has no date or 30-day values`);
        errors++;
        continue;
      }

      const observationDate = new Date(`${row.date}T00:00:00.000Z`);
      if (Number.isNaN(observationDate.getTime())) {
        console.error(`  ${cc}: invalid observation date ${row.date}`);
        errors++;
        continue;
      }
      const preferredPc = Number(interval.preferred_pc ?? 0);
      const capablePc = Number(interval.capable_pc ?? 0);
      const sampleN = Math.round(Number(interval.seen ?? 0));

      await prisma.countryMetric.upsert({
        where: { date_cc: { date: observationDate, cc } },
        update: { preferredPc, capablePc, sampleN },
        create: { date: observationDate, cc, preferredPc, capablePc, sampleN, source: 'APNIC' },
      });
      updated++;
      console.log(`  ${cc}: ${preferredPc}% preferred, ${capablePc}% capable`);
    } catch (e: any) {
      console.error(`  ${cc}: ${e?.message ?? 'unknown error'}`);
      errors++;
    }
  }

  console.log(`\nDone! Updated: ${updated}, Errors: ${errors}`);
}

main()
  .catch((e: any) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
