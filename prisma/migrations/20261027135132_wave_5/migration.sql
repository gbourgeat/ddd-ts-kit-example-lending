/*
  Warnings:

  - Added the required column `account_id` to the `staff_members` table without a default value. This is not possible if the table is not empty.
  - The owner accepts it: no environment holds a staff member yet. Once one does, a column added
    NOT NULL is added nullable, backfilled, then set NOT NULL, in three migrations.

*/
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "customer_due_diligence";

-- AlterTable
ALTER TABLE "branch_network"."staff_members" ADD COLUMN     "account_id" TEXT NOT NULL,
ADD COLUMN     "own_customer_id" TEXT;

-- AlterTable
ALTER TABLE "financial_crime"."suspicious_activity_reports" ADD COLUMN     "filing_reference" TEXT;

-- CreateTable
CREATE TABLE "credit_application"."listed_applications" (
    "id" TEXT NOT NULL,
    "applicant_id" TEXT NOT NULL,
    "requested_amount_cents" INTEGER NOT NULL,
    "duration_months" INTEGER NOT NULL,
    "submitted_at" TIMESTAMPTZ(3) NOT NULL,
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "listed_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_due_diligence"."customer_files" (
    "id" TEXT NOT NULL,
    "identified_at" TIMESTAMPTZ(3) NOT NULL,
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "customer_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "listed_applications_tenant_idx" ON "credit_application"."listed_applications"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "customer_files_tenant_idx" ON "customer_due_diligence"."customer_files"("tenant_id", "id");
