-- CreateTable
CREATE TABLE "countries" (
    "cc" VARCHAR(2) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "sub_region" VARCHAR(50),
    "population" BIGINT DEFAULT 0,
    "internet_users" BIGINT DEFAULT 0,
    "is_testbed" BOOLEAN NOT NULL DEFAULT false,
    "testbed_notes" TEXT,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("cc")
);

-- CreateTable
CREATE TABLE "country_metrics" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "cc" VARCHAR(2) NOT NULL,
    "preferred_pc" DECIMAL(6,3),
    "capable_pc" DECIMAL(6,3),
    "sample_n" INTEGER,
    "source" VARCHAR(50) NOT NULL DEFAULT 'APNIC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "country_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "afrinic_allocations" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "cc" VARCHAR(2) NOT NULL,
    "allocation_count" INTEGER NOT NULL DEFAULT 0,
    "total_32s" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "source" VARCHAR(50) NOT NULL DEFAULT 'AFRINIC',

    CONSTRAINT "afrinic_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cloudflare_metrics" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "cc" VARCHAR(2) NOT NULL,
    "ipv6_traffic_pct" DECIMAL(6,3),
    "source" VARCHAR(50) NOT NULL DEFAULT 'Cloudflare',

    CONSTRAINT "cloudflare_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asn_metrics" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "cc" VARCHAR(2) NOT NULL,
    "asn" INTEGER NOT NULL,
    "asn_name" VARCHAR(200),
    "preferred_pc" DECIMAL(6,3),
    "capable_pc" DECIMAL(6,3),
    "source" VARCHAR(50) NOT NULL DEFAULT 'APNIC',

    CONSTRAINT "asn_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etl_log" (
    "id" SERIAL NOT NULL,
    "run_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" VARCHAR(50),
    "status" VARCHAR(20),
    "countries_updated" INTEGER,
    "message" TEXT,

    CONSTRAINT "etl_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "country_metrics_cc_idx" ON "country_metrics"("cc");

-- CreateIndex
CREATE INDEX "country_metrics_date_idx" ON "country_metrics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "country_metrics_date_cc_key" ON "country_metrics"("date", "cc");

-- CreateIndex
CREATE INDEX "afrinic_allocations_cc_idx" ON "afrinic_allocations"("cc");

-- CreateIndex
CREATE UNIQUE INDEX "afrinic_allocations_date_cc_key" ON "afrinic_allocations"("date", "cc");

-- CreateIndex
CREATE INDEX "cloudflare_metrics_cc_idx" ON "cloudflare_metrics"("cc");

-- CreateIndex
CREATE UNIQUE INDEX "cloudflare_metrics_date_cc_key" ON "cloudflare_metrics"("date", "cc");

-- CreateIndex
CREATE INDEX "asn_metrics_cc_idx" ON "asn_metrics"("cc");

-- CreateIndex
CREATE INDEX "asn_metrics_date_idx" ON "asn_metrics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "asn_metrics_date_cc_asn_key" ON "asn_metrics"("date", "cc", "asn");

-- AddForeignKey
ALTER TABLE "country_metrics" ADD CONSTRAINT "country_metrics_cc_fkey" FOREIGN KEY ("cc") REFERENCES "countries"("cc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "afrinic_allocations" ADD CONSTRAINT "afrinic_allocations_cc_fkey" FOREIGN KEY ("cc") REFERENCES "countries"("cc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cloudflare_metrics" ADD CONSTRAINT "cloudflare_metrics_cc_fkey" FOREIGN KEY ("cc") REFERENCES "countries"("cc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asn_metrics" ADD CONSTRAINT "asn_metrics_cc_fkey" FOREIGN KEY ("cc") REFERENCES "countries"("cc") ON DELETE RESTRICT ON UPDATE CASCADE;

