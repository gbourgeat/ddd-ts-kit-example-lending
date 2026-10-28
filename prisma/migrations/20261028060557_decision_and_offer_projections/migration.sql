-- CreateTable
CREATE TABLE "credit_application"."delegation_tables" (
    "delegation_table_id" TEXT NOT NULL,
    "effective_from" TIMESTAMPTZ(3) NOT NULL,
    "levels" JSONB NOT NULL,
    "last_event_at" TIMESTAMPTZ(3) NOT NULL,
    "last_event_id" TEXT NOT NULL,
    "last_event_version" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "delegation_tables_pkey" PRIMARY KEY ("delegation_table_id")
);

-- CreateTable
CREATE TABLE "credit_application"."decider_levels" (
    "staff_member_id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "last_event_at" TIMESTAMPTZ(3) NOT NULL,
    "last_event_id" TEXT NOT NULL,
    "last_event_version" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "decider_levels_pkey" PRIMARY KEY ("staff_member_id")
);

-- CreateTable
CREATE TABLE "credit_application"."rate_grids" (
    "rate_grid_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "effective_from" TIMESTAMPTZ(3) NOT NULL,
    "last_event_at" TIMESTAMPTZ(3) NOT NULL,
    "last_event_id" TEXT NOT NULL,
    "last_event_version" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "rate_grids_pkey" PRIMARY KEY ("rate_grid_id")
);

-- CreateTable
CREATE TABLE "credit_application"."legal_maximum_rates" (
    "legal_maximum_rate_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rate_basis_points" INTEGER NOT NULL,
    "effective_from" TIMESTAMPTZ(3) NOT NULL,
    "last_event_at" TIMESTAMPTZ(3) NOT NULL,
    "last_event_id" TEXT NOT NULL,
    "last_event_version" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "legal_maximum_rates_pkey" PRIMARY KEY ("legal_maximum_rate_id")
);

-- CreateIndex
CREATE INDEX "delegation_tables_tenant_idx" ON "credit_application"."delegation_tables"("tenant_id", "delegation_table_id");

-- CreateIndex
CREATE INDEX "decider_levels_tenant_idx" ON "credit_application"."decider_levels"("tenant_id", "staff_member_id");

-- CreateIndex
CREATE INDEX "rate_grids_tenant_idx" ON "credit_application"."rate_grids"("tenant_id", "rate_grid_id");

-- CreateIndex
CREATE INDEX "legal_maximum_rates_tenant_idx" ON "credit_application"."legal_maximum_rates"("tenant_id", "legal_maximum_rate_id");
