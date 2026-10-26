/**
 * Backfill script: fetches APNIC data for all 54 African countries
 * for the current day. Run once to seed initial data.
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
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
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

      // Last row = most recent data. Fields are nested under 'raw'
      const row = rows[rows.length - 1];
      const raw = row?.raw ?? row;
      const preferredPc = parseFloat(raw?.preferred_pc ?? raw?.pref_percent ?? '0') || 0;
      const capablePc = parseFloat(raw?.capable_pc ?? raw?.able_percent ?? '0') || 0;
      const sampleN = parseInt(raw?.seen ?? raw?.n ?? '0', 10) || 0;

      await prisma.countryMetric.upsert({
        where: { date_cc: { date: today, cc } },
        update: { preferredPc, capablePc, sampleN },
        create: { date: today, cc, preferredPc, capablePc, sampleN, source: 'APNIC' },
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
