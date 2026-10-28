-- CreateTable
CREATE TABLE "credit_application"."product_terms" (
    "product_id" TEXT NOT NULL,
    "amount_minimum_cents" INTEGER NOT NULL,
    "amount_maximum_cents" INTEGER NOT NULL,
    "duration_minimum_months" INTEGER NOT NULL,
    "duration_maximum_months" INTEGER NOT NULL,
    "arrangement_fee_cents" INTEGER NOT NULL,
    "insurance_mandatory" BOOLEAN NOT NULL,
    "last_event_at" TIMESTAMPTZ(3) NOT NULL,
    "last_event_id" TEXT NOT NULL,
    "last_event_version" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "product_terms_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "credit_application"."broker_registrations" (
    "broker_id" TEXT NOT NULL,
    "in_force" BOOLEAN NOT NULL,
    "changed_at" TIMESTAMPTZ(3) NOT NULL,
    "last_event_at" TIMESTAMPTZ(3) NOT NULL,
    "last_event_id" TEXT NOT NULL,
    "last_event_version" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "broker_registrations_pkey" PRIMARY KEY ("broker_id")
);

-- CreateIndex
CREATE INDEX "product_terms_tenant_idx" ON "credit_application"."product_terms"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "broker_registrations_tenant_idx" ON "credit_application"."broker_registrations"("tenant_id", "broker_id");
