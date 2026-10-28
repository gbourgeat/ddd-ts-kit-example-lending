-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "reporting";

-- CreateTable
CREATE TABLE "data_protection"."impact_assessments" (
    "id" TEXT NOT NULL,
    "registered_at" TIMESTAMPTZ(3) NOT NULL,
    "scoring_model_version" TEXT NOT NULL,
    "month" VARCHAR(7) NOT NULL,
    "version" INTEGER NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "impact_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reporting"."application_counts" (
    "key" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "application_count" INTEGER NOT NULL,
    "amount_cents" BIGINT NOT NULL,
    "last_event_at" TIMESTAMPTZ(3) NOT NULL,
    "last_event_id" TEXT NOT NULL,
    "last_event_version" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "application_counts_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "impact_assessments_tenant_idx" ON "data_protection"."impact_assessments"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "application_counts_tenant_idx" ON "reporting"."application_counts"("tenant_id", "branch_id", "month");
