import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const AFRICAN_COUNTRIES = [
  { cc: 'DZ', name: 'Algeria', subRegion: 'North Africa' },
  { cc: 'AO', name: 'Angola', subRegion: 'Southern Africa' },
  { cc: 'BJ', name: 'Benin', subRegion: 'West Africa' },
  { cc: 'BW', name: 'Botswana', subRegion: 'Southern Africa', isTestbed: true },
  { cc: 'BF', name: 'Burkina Faso', subRegion: 'West Africa' },
  { cc: 'BI', name: 'Burundi', subRegion: 'East Africa' },
  { cc: 'CM', name: 'Cameroon', subRegion: 'Central Africa', isTestbed: true },
  { cc: 'CV', name: 'Cabo Verde', subRegion: 'West Africa' },
  { cc: 'CF', name: 'Central African Republic', subRegion: 'Central Africa' },
  { cc: 'TD', name: 'Chad', subRegion: 'Central Africa' },
  { cc: 'KM', name: 'Comoros', subRegion: 'East Africa' },
  { cc: 'CG', name: 'Congo', subRegion: 'Central Africa' },
  { cc: 'CD', name: 'DR Congo', subRegion: 'Central Africa' },
  { cc: 'CI', name: "Côte d'Ivoire", subRegion: 'West Africa' },
  { cc: 'DJ', name: 'Djibouti', subRegion: 'East Africa' },
  { cc: 'EG', name: 'Egypt', subRegion: 'North Africa' },
  { cc: 'GQ', name: 'Equatorial Guinea', subRegion: 'Central Africa' },
  { cc: 'ER', name: 'Eritrea', subRegion: 'East Africa' },
  { cc: 'SZ', name: 'Eswatini', subRegion: 'Southern Africa' },
  { cc: 'ET', name: 'Ethiopia', subRegion: 'East Africa' },
  { cc: 'GA', name: 'Gabon', subRegion: 'Central Africa' },
  { cc: 'GM', name: 'Gambia', subRegion: 'West Africa' },
  { cc: 'GH', name: 'Ghana', subRegion: 'West Africa', isTestbed: true },
  { cc: 'GN', name: 'Guinea', subRegion: 'West Africa' },
  { cc: 'GW', name: 'Guinea-Bissau', subRegion: 'West Africa' },
  { cc: 'KE', name: 'Kenya', subRegion: 'East Africa' },
  { cc: 'LS', name: 'Lesotho', subRegion: 'Southern Africa' },
  { cc: 'LR', name: 'Liberia', subRegion: 'West Africa' },
  { cc: 'LY', name: 'Libya', subRegion: 'North Africa' },
  { cc: 'MG', name: 'Madagascar', subRegion: 'East Africa' },
  { cc: 'MW', name: 'Malawi', subRegion: 'East Africa' },
  { cc: 'ML', name: 'Mali', subRegion: 'West Africa' },
  { cc: 'MR', name: 'Mauritania', subRegion: 'West Africa' },
  { cc: 'MU', name: 'Mauritius', subRegion: 'East Africa' },
  { cc: 'MA', name: 'Morocco', subRegion: 'North Africa' },
  { cc: 'MZ', name: 'Mozambique', subRegion: 'East Africa' },
  { cc: 'NA', name: 'Namibia', subRegion: 'Southern Africa' },
  { cc: 'NE', name: 'Niger', subRegion: 'West Africa' },
  { cc: 'NG', name: 'Nigeria', subRegion: 'West Africa' },
  { cc: 'RW', name: 'Rwanda', subRegion: 'East Africa' },
  { cc: 'ST', name: 'São Tomé and Príncipe', subRegion: 'Central Africa' },
  { cc: 'SN', name: 'Senegal', subRegion: 'West Africa' },
  { cc: 'SC', name: 'Seychelles', subRegion: 'East Africa' },
  { cc: 'SL', name: 'Sierra Leone', subRegion: 'West Africa' },
  { cc: 'SO', name: 'Somalia', subRegion: 'East Africa' },
  { cc: 'ZA', name: 'South Africa', subRegion: 'Southern Africa' },
  { cc: 'SS', name: 'South Sudan', subRegion: 'East Africa' },
  { cc: 'SD', name: 'Sudan', subRegion: 'North Africa' },
  { cc: 'TZ', name: 'Tanzania', subRegion: 'East Africa', isTestbed: true },
  { cc: 'TG', name: 'Togo', subRegion: 'West Africa', isTestbed: true },
  { cc: 'TN', name: 'Tunisia', subRegion: 'North Africa', isTestbed: true },
  { cc: 'UG', name: 'Uganda', subRegion: 'East Africa' },
  { cc: 'ZM', name: 'Zambia', subRegion: 'Southern Africa' },
  { cc: 'ZW', name: 'Zimbabwe', subRegion: 'Southern Africa' },
];

async function main() {
  console.log('Seeding countries...');
  for (const c of AFRICAN_COUNTRIES) {
    await prisma.country.upsert({
      where: { cc: c.cc },
      update: {
        name: c.name,
        subRegion: c.subRegion,
        isTestbed: c.isTestbed ?? false,
      },
      create: {
        cc: c.cc,
        name: c.name,
        subRegion: c.subRegion,
        isTestbed: c.isTestbed ?? false,
      },
    });
  }
  console.log(`Seeded ${AFRICAN_COUNTRIES.length} countries.`);
}

main()
  .catch((e: any) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
