# ATU Africa IPv6 Monitor

A full-stack web application for tracking IPv6 adoption across the African continent, built for the African Telecommunications Union (ATU).

## Features

- **Interactive Map** — Choropleth map of Africa showing IPv6 preferred % by country
- **Dashboard** — KPIs, regional breakdowns, rankings, and fast movers
- **Testbed Countries** — Dedicated tracking for ATU’s 6 pilot countries (Ghana, Botswana, Togo, Tunisia, Cameroon, Tanzania)
- **Regional View** — Sub-regional analysis (North, West, East, Central, Southern Africa)
- **Allocations** — AFRINIC IPv6 address space allocation tracking
- **Country Detail** — Per-country deep dive with time series charts
- **Export** — Excel and PDF export for reporting

## Data Sources

| Source | What | Update |
|--------|------|--------|
| [APNIC Labs](https://stats.labs.apnic.net/ipv6) | IPv6 Preferred %, Capable %, Sample Size | Daily |
| [AFRINIC](https://ftp.afrinic.net/stats/afrinic/) | IPv6 allocations per country | Daily |
| [Cloudflare Radar](https://radar.cloudflare.com/) | IPv6 traffic share | Daily |

## Quick Start

### Docker (recommended)

```bash
cp .env.example .env
# Edit .env with your values
docker-compose up -d
```

### Local Development

```bash
# Install dependencies
yarn install

# Set up database
cp .env.example .env
# Edit .env with your DATABASE_URL
npx prisma generate
npx prisma db push

# Seed countries
yarn prisma db seed

# Backfill initial data
yarn tsx --require dotenv/config scripts/backfill.ts

# Start dev server
yarn dev
```

### ETL

Trigger a full data refresh:
```bash
curl -X POST http://localhost:3000/api/etl/run-all \
  -H "x-etl-secret: YOUR_ETL_SECRET" \
  -H "Content-Type: application/json"
```

### Automated Daily Updates

Use the included GitHub Actions workflow (`.github/workflows/daily-etl.yml`), or set up a cron job:
```bash
curl -X GET http://your-domain/api/cron/daily \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Environment Variables

See `.env.example` for all required variables.

## Tech Stack

- **Framework**: Next.js with TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Charts**: Recharts, ECharts (dashboard kit)
- **Map**: react-simple-maps
- **Export**: xlsx (Excel), browser print (PDF)
- **Deployment**: Docker, or any Node.js hosting

## License

© African Telecommunications Union. All rights reserved.
