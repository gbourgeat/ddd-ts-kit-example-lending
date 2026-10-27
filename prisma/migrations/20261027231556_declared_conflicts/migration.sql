-- CreateTable
CREATE TABLE "credit_application"."declared_conflicts" (
    "id" TEXT NOT NULL,
    "staff_member_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL,
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "declared_conflicts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "declared_conflicts_tenant_idx" ON "credit_application"."declared_conflicts"("tenant_id", "customer_id");
