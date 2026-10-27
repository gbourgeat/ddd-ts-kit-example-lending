-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "audit";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "authorization";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "branch_network";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "brokerage";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "credit_application";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "credit_policy";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "credit_scoring";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "data_protection";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "event_store";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "financial_crime";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "identity";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "messaging";

-- CreateEnum
CREATE TYPE "identity"."account_status" AS ENUM ('active', 'deactivated');

-- CreateEnum
CREATE TYPE "identity"."member_role" AS ENUM ('owner', 'admin', 'member');

-- CreateEnum
CREATE TYPE "identity"."invitation_status" AS ENUM ('pending', 'accepted', 'declined', 'revoked');

-- CreateTable
CREATE TABLE "branch_network"."branches" (
    "id" TEXT NOT NULL,
    "registered_at" TIMESTAMPTZ(3) NOT NULL,
    "version" INTEGER NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_network"."staff_members" (
    "id" TEXT NOT NULL,
    "registered_at" TIMESTAMPTZ(3) NOT NULL,
    "branch_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "staff_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_network"."portfolios" (
    "id" TEXT NOT NULL,
    "registered_at" TIMESTAMPTZ(3) NOT NULL,
    "advisor_id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_network"."conflict_of_interests" (
    "id" TEXT NOT NULL,
    "registered_at" TIMESTAMPTZ(3) NOT NULL,
    "staff_member_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "conflict_of_interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brokerage"."brokers" (
    "id" TEXT NOT NULL,
    "registered_at" TIMESTAMPTZ(3) NOT NULL,
    "registration_number" TEXT NOT NULL,
    "lapsed_on" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "brokers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_application"."offers" (
    "id" TEXT NOT NULL,
    "registered_at" TIMESTAMPTZ(3) NOT NULL,
    "version" INTEGER NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_policy"."products" (
    "id" TEXT NOT NULL,
    "registered_at" TIMESTAMPTZ(3) NOT NULL,
    "amount_minimum_cents" INTEGER NOT NULL,
    "amount_maximum_cents" INTEGER NOT NULL,
    "duration_minimum_months" INTEGER NOT NULL,
    "duration_maximum_months" INTEGER NOT NULL,
    "arrangement_fee_cents" INTEGER NOT NULL,
    "insurance_mandatory" BOOLEAN NOT NULL,
    "score_threshold" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_policy"."rate_grids" (
    "id" TEXT NOT NULL,
    "registered_at" TIMESTAMPTZ(3) NOT NULL,
    "product_id" TEXT NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "rate_grids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_policy"."legal_maximum_rates" (
    "id" TEXT NOT NULL,
    "registered_at" TIMESTAMPTZ(3) NOT NULL,
    "category" TEXT NOT NULL,
    "rate_basis_points" INTEGER NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "legal_maximum_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_policy"."delegation_tables" (
    "id" TEXT NOT NULL,
    "registered_at" TIMESTAMPTZ(3) NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "levels" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "delegation_tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_policy"."residual_income_minimums" (
    "id" TEXT NOT NULL,
    "registered_at" TIMESTAMPTZ(3) NOT NULL,
    "per_adult_in_cents" INTEGER NOT NULL,
    "per_child_in_cents" INTEGER NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "residual_income_minimums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_scoring"."scoring_models" (
    "id" TEXT NOT NULL,
    "registered_at" TIMESTAMPTZ(3) NOT NULL,
    "version" INTEGER NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "scoring_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_protection"."retention_periods" (
    "id" TEXT NOT NULL,
    "registered_at" TIMESTAMPTZ(3) NOT NULL,
    "context_name" TEXT NOT NULL,
    "kind_of_data" TEXT NOT NULL,
    "duration_in_months" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "retention_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_crime"."alerts" (
    "id" TEXT NOT NULL,
    "registered_at" TIMESTAMPTZ(3) NOT NULL,
    "repayment_reference" TEXT NOT NULL,
    "closed_at" TIMESTAMPTZ(3),
    "closure_reason" TEXT,
    "version" INTEGER NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_crime"."suspicious_activity_reports" (
    "id" TEXT NOT NULL,
    "registered_at" TIMESTAMPTZ(3) NOT NULL,
    "subject_reference" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "suspicious_activity_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" "identity"."account_status" NOT NULL,
    "provisioned_at" TIMESTAMPTZ(3) NOT NULL,
    "deactivated_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."organisations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "opened_by" TEXT NOT NULL,
    "opened_at" TIMESTAMPTZ(3) NOT NULL,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "organisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."members" (
    "id" TEXT NOT NULL,
    "organisation_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "role" "identity"."member_role" NOT NULL,
    "joined_at" TIMESTAMPTZ(3) NOT NULL,
    "removed_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."invitations" (
    "id" TEXT NOT NULL,
    "organisation_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "identity"."member_role" NOT NULL,
    "token_hash" TEXT NOT NULL,
    "invited_by" TEXT NOT NULL,
    "issued_at" TIMESTAMPTZ(3) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "status" "identity"."invitation_status" NOT NULL,
    "answered_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."delegations" (
    "id" TEXT NOT NULL,
    "organisation_id" TEXT NOT NULL,
    "delegator_id" TEXT NOT NULL,
    "delegate_id" TEXT NOT NULL,
    "rights" TEXT NOT NULL,
    "starts_at" TIMESTAMPTZ(3) NOT NULL,
    "ends_at" TIMESTAMPTZ(3) NOT NULL,
    "ended_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "delegations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messaging"."outbox" (
    "id" TEXT NOT NULL,
    "sequence" BIGSERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "occurred_at" TEXT NOT NULL,
    "payload" JSONB,
    "traceparent" TEXT,
    "correlation_id" TEXT,
    "tenant_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "next_attempt_at" TIMESTAMPTZ(3) NOT NULL,
    "last_error_code" TEXT,
    "published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messaging"."processed_events" (
    "consumer" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "processed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processed_events_pkey" PRIMARY KEY ("consumer","event_id")
);

-- CreateTable
CREATE TABLE "messaging"."process_instances" (
    "tenant_id" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "ended" BOOLEAN NOT NULL DEFAULT false,
    "timeouts" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "process_instances_pkey" PRIMARY KEY ("tenant_id","name","id")
);

-- CreateTable
CREATE TABLE "authorization"."relation_tuples" (
    "object" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "subject" TEXT NOT NULL,

    CONSTRAINT "relation_tuples_pkey" PRIMARY KEY ("object","relation","subject")
);

-- CreateTable
CREATE TABLE "event_store"."stored_events_head" (
    "id" SMALLINT NOT NULL,
    "position" BIGINT NOT NULL,

    CONSTRAINT "stored_events_head_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_store"."stored_events" (
    "position" BIGINT NOT NULL,
    "stream" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "event_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "schema_version" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "metadata" JSONB NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL,
    "tenant_id" TEXT,
    "recorded_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stored_events_pkey" PRIMARY KEY ("position")
);

-- CreateTable
CREATE TABLE "event_store"."stream_snapshots" (
    "stream" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "schema_version" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "taken_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stream_snapshots_pkey" PRIMARY KEY ("stream")
);

-- CreateTable
CREATE TABLE "event_store"."subscription_checkpoints" (
    "subscriber" TEXT NOT NULL,
    "position" BIGINT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_checkpoints_pkey" PRIMARY KEY ("subscriber")
);

-- CreateTable
CREATE TABLE "event_store"."subject_keys" (
    "subject" TEXT NOT NULL,
    "key_id" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subject_keys_pkey" PRIMARY KEY ("subject")
);

-- CreateTable
CREATE TABLE "audit"."audit_entries" (
    "id" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "sequence" BIGINT NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL,
    "category" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "reason" TEXT,
    "actor_id" TEXT NOT NULL,
    "actor_type" TEXT NOT NULL,
    "actor_tenant_id" TEXT,
    "tenant_id" TEXT,
    "impersonated_by" TEXT,
    "session_id" TEXT,
    "resource_type" TEXT,
    "resource_id" TEXT,
    "context" TEXT,
    "correlation_id" TEXT NOT NULL,
    "causation_id" TEXT,
    "origin" TEXT NOT NULL,
    "changes" JSONB,
    "extensions" JSONB NOT NULL DEFAULT '{}',
    "previous_hash" TEXT NOT NULL,
    "hash" TEXT NOT NULL,

    CONSTRAINT "audit_entries_pkey" PRIMARY KEY ("chain","sequence")
);

-- CreateTable
CREATE TABLE "audit"."audit_archives" (
    "chain" TEXT NOT NULL,
    "from_sequence" BIGINT NOT NULL,
    "to_sequence" BIGINT NOT NULL,
    "last_hash" TEXT NOT NULL,
    "entries" INTEGER NOT NULL,
    "file_key" TEXT NOT NULL,
    "file_digest" TEXT NOT NULL,
    "archived_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "audit_archives_pkey" PRIMARY KEY ("chain","to_sequence")
);

-- CreateTable
CREATE TABLE "audit"."audit_chains" (
    "chain" TEXT NOT NULL,
    "sequence" BIGINT NOT NULL,
    "hash" TEXT NOT NULL,

    CONSTRAINT "audit_chains_pkey" PRIMARY KEY ("chain")
);

-- CreateIndex
CREATE INDEX "branches_tenant_idx" ON "branch_network"."branches"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "staff_members_tenant_idx" ON "branch_network"."staff_members"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "portfolios_tenant_idx" ON "branch_network"."portfolios"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "conflict_of_interests_tenant_idx" ON "branch_network"."conflict_of_interests"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "brokers_tenant_idx" ON "brokerage"."brokers"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "offers_tenant_idx" ON "credit_application"."offers"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "products_tenant_idx" ON "credit_policy"."products"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "rate_grids_tenant_idx" ON "credit_policy"."rate_grids"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "legal_maximum_rates_tenant_idx" ON "credit_policy"."legal_maximum_rates"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "delegation_tables_tenant_idx" ON "credit_policy"."delegation_tables"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "residual_income_minimums_tenant_idx" ON "credit_policy"."residual_income_minimums"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "scoring_models_tenant_idx" ON "credit_scoring"."scoring_models"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "retention_periods_tenant_idx" ON "data_protection"."retention_periods"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "alerts_tenant_idx" ON "financial_crime"."alerts"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "suspicious_activity_reports_tenant_idx" ON "financial_crime"."suspicious_activity_reports"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "members_account_idx" ON "identity"."members"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_current_idx" ON "identity"."members"("organisation_id", "account_id") WHERE ("removed_at" IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_hash_key" ON "identity"."invitations"("token_hash");

-- CreateIndex
CREATE INDEX "invitations_organisation_idx" ON "identity"."invitations"("organisation_id", "status");

-- CreateIndex
CREATE INDEX "delegations_delegate_idx" ON "identity"."delegations"("organisation_id", "delegate_id");

-- CreateIndex
CREATE INDEX "delegations_delegator_idx" ON "identity"."delegations"("organisation_id", "delegator_id");

-- CreateIndex
CREATE UNIQUE INDEX "outbox_sequence_key" ON "messaging"."outbox"("sequence");

-- CreateIndex
CREATE INDEX "outbox_status_next_attempt_at_sequence_idx" ON "messaging"."outbox"("status", "next_attempt_at", "sequence");

-- CreateIndex
CREATE INDEX "relation_tuples_subject_idx" ON "authorization"."relation_tuples"("subject");

-- CreateIndex
CREATE UNIQUE INDEX "stored_events_event_id_key" ON "event_store"."stored_events"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "stored_events_stream_version_key" ON "event_store"."stored_events"("stream", "version");

-- CreateIndex
CREATE UNIQUE INDEX "subject_keys_key_id_key" ON "event_store"."subject_keys"("key_id");

-- CreateIndex
CREATE UNIQUE INDEX "audit_entries_id_key" ON "audit"."audit_entries"("id");

-- CreateIndex
CREATE INDEX "audit_entries_occurred_idx" ON "audit"."audit_entries"("occurred_at", "chain", "sequence");

-- CreateIndex
CREATE INDEX "audit_entries_actor_idx" ON "audit"."audit_entries"("actor_id", "occurred_at");

-- CreateIndex
CREATE INDEX "audit_entries_resource_idx" ON "audit"."audit_entries"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "audit_entries_correlation_idx" ON "audit"."audit_entries"("correlation_id");

-- The audit trail is append-only: @ddd-ts-kit/audit refuses to rewrite it.
create or replace function "audit"."audit_entries_append_only"() returns trigger language plpgsql as $guard$ begin if tg_op = 'DELETE' then if exists (select 1 from "audit"."audit_archives" a where a."chain" = old."chain" and old."sequence" <= a."to_sequence") then return old; end if; end if; raise exception 'audit entries are append-only: % refused', tg_op using errcode = 'restrict_violation'; end $guard$;

create or replace function "audit"."audit_archives_append_only"() returns trigger language plpgsql as $guard$ begin raise exception 'audit archives are append-only: % refused', tg_op using errcode = 'restrict_violation'; end $guard$;

create trigger "audit_entries_no_rewrite" before update or delete on "audit"."audit_entries" for each row execute function "audit"."audit_entries_append_only"();

create trigger "audit_entries_no_truncate" before truncate on "audit"."audit_entries" for each statement execute function "audit"."audit_entries_append_only"();

create trigger "audit_archives_no_rewrite" before update or delete on "audit"."audit_archives" for each row execute function "audit"."audit_archives_append_only"();

create trigger "audit_archives_no_truncate" before truncate on "audit"."audit_archives" for each statement execute function "audit"."audit_archives_append_only"();
