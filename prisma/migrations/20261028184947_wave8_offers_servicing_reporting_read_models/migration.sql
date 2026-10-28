/*
  Warnings:

  - Added the required column `amount_cents` to the `offers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `annual_percentage_rate_tenths` to the `offers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `application_id` to the `offers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `arrangement_fee_cents` to the `offers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration_months` to the `offers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instalment_cents` to the `offers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `legal_maximum_basis_points` to the `offers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rate_basis_points` to the `offers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "servicing";

-- AlterTable
ALTER TABLE "credit_application"."offers" ADD COLUMN     "amount_cents" INTEGER NOT NULL,
ADD COLUMN     "annual_percentage_rate_tenths" INTEGER NOT NULL,
ADD COLUMN     "application_id" TEXT NOT NULL,
ADD COLUMN     "arrangement_fee_cents" INTEGER NOT NULL,
ADD COLUMN     "duration_months" INTEGER NOT NULL,
ADD COLUMN     "instalment_cents" INTEGER NOT NULL,
ADD COLUMN     "issued_at" TIMESTAMPTZ(3),
ADD COLUMN     "legal_maximum_basis_points" INTEGER NOT NULL,
ADD COLUMN     "rate_basis_points" INTEGER NOT NULL,
ADD COLUMN     "signed_at" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "credit_application"."rate_grids" ADD COLUMN     "rates" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "credit_policy"."rate_grids" ADD COLUMN     "rates" JSONB NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "reporting"."decision_counts" (
    "key" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "decision_count" INTEGER NOT NULL,
    "approval_count" INTEGER NOT NULL,
    "exception_count" INTEGER NOT NULL,
    "last_event_at" TIMESTAMPTZ(3) NOT NULL,
    "last_event_id" TEXT NOT NULL,
    "last_event_version" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "decision_counts_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "reporting"."portfolio_at_risk" (
    "key" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "loan_id" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "last_event_at" TIMESTAMPTZ(3) NOT NULL,
    "last_event_id" TEXT NOT NULL,
    "last_event_version" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "portfolio_at_risk_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "reporting"."loan_principals" (
    "key" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "loan_id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "principal_cents" INTEGER NOT NULL,
    "last_event_at" TIMESTAMPTZ(3) NOT NULL,
    "last_event_id" TEXT NOT NULL,
    "last_event_version" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "loan_principals_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "reporting"."defaulted_loans" (
    "key" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "loan_id" TEXT NOT NULL,
    "defaulted_at" TIMESTAMPTZ(3) NOT NULL,
    "last_event_at" TIMESTAMPTZ(3) NOT NULL,
    "last_event_id" TEXT NOT NULL,
    "last_event_version" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "defaulted_loans_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "servicing"."portfolio_at_risk" (
    "tenant_id" TEXT NOT NULL,
    "loan_id" TEXT NOT NULL,
    "principal_cents" INTEGER NOT NULL,
    "bucket" TEXT NOT NULL,
    "open" BOOLEAN NOT NULL,
    "last_event_at" TIMESTAMPTZ(3) NOT NULL,
    "last_event_id" TEXT NOT NULL,
    "last_event_version" BIGINT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "portfolio_at_risk_pkey" PRIMARY KEY ("loan_id")
);

-- CreateIndex
CREATE INDEX "decision_counts_tenant_idx" ON "reporting"."decision_counts"("tenant_id", "branch_id", "month");

-- CreateIndex
CREATE INDEX "portfolio_at_risk_tenant_idx" ON "reporting"."portfolio_at_risk"("tenant_id");

-- CreateIndex
CREATE INDEX "loan_principals_tenant_idx" ON "reporting"."loan_principals"("tenant_id", "branch_id");

-- CreateIndex
CREATE INDEX "defaulted_loans_tenant_idx" ON "reporting"."defaulted_loans"("tenant_id");

-- CreateIndex
CREATE INDEX "portfolio_at_risk_tenant_idx" ON "servicing"."portfolio_at_risk"("tenant_id");
