import {
  TenantAuditReader,
  auditDecisions,
  auditGuardRefusals,
  auditIntegrationEvents,
  auditMiddleware,
  type ArchivableAuditTrail,
  type AuditReader,
  type AuditSource,
  type AuditTrail,
  type GuardRefusalOfARoute,
} from '@ddd-ts-kit/audit';
import { PrismaAuditTrail } from '@ddd-ts-kit/audit/prisma';
import type { OnDecision } from '@ddd-ts-kit/auth';
import type { EventSubscription } from '@ddd-ts-kit/events';
import type { BusMiddleware } from '@ddd-ts-kit/kernel';
import type { Persistence } from '@/platform/database/persistence';
import { auditPermissions } from '@/platform/audit/audit.permissions';
import { auditedEvents } from '@/platform/audit/audited-events';
import { chainOfStream } from '@/platform/audit/streams/chain-of-stream';
import { GetCustomerFileQuery } from '@/contexts/customer-due-diligence/application/queries/get-customer-file/get-customer-file.query';
import { SearchAuditEntriesQuery } from '@/platform/audit/search-audit-entries/search-audit-entries.query';

/** The name the audit trail consumes integration events under: its idempotency scope, and its queues behind a broker. */
const consumer = 'audit';

/**
 * The audit trail and its three sources. No use case writes to it: the entries come from the
 * authorization hook, from the buses and from a subscription to every integration event, and
 * each one carries the correlation id, the actor and the tenant of the execution scope.
 */
export interface Audit {
  /** The store of the entries: written by the three sources, searched, its oldest entries archived. */
  readonly trail: AuditTrail & AuditReader & ArchivableAuditTrail;
  /**
   * The trail as the read side searches it: confined to the tenant of the work in progress,
   * whatever the filter or the actor says. Platform staff read across tenants only inside
   * `acrossTenants`, which records the elevation first; work in no tenant is refused.
   */
  readonly reader: AuditReader;
  /** The `onDecision` hook of the authorization: who was allowed or refused what. */
  readonly decisions: OnDecision;
  /** The `onGuardRefusal` hook of the HTTP pipeline: who a guard refused at the edge, before any use case. */
  readonly refusals: (refusal: GuardRefusalOfARoute) => Promise<void>;
  /** On the command bus, before the unit of work: which command ran and how it ended. */
  readonly commands: BusMiddleware;
  /** On the query bus: whoever reads the trail leaves an entry in it. */
  readonly queries: BusMiddleware;
  /** One subscription per declared integration event: that it occurred, never its payload. */
  readonly subscriptions: readonly EventSubscription[];
  /** The name those subscriptions listen under. */
  readonly consumer: string;
}

export function createAudit(persistence: Persistence, source: AuditSource): Audit {
  const trail = createAuditTrail(persistence);
  const { unitOfWork, processedEvents } = persistence;

  return {
    trail,
    reader: new TenantAuditReader(trail, source.scope),
    refusals: auditGuardRefusals(trail, source),
    decisions: auditDecisions(trail, { ...source, sensitivePermissions: [auditPermissions['trail.read'].id] }),
    // Each command declares what may go into `changes` with `fields: [auditedFields(SomeCommand, ['status'])]` as it arrives; until then an entry carries identifiers and codes only.
    commands: auditMiddleware(trail, { ...source, unitOfWork }),
    queries: auditMiddleware(trail, { ...source, queries: [SearchAuditEntriesQuery, GetCustomerFileQuery] }),
    subscriptions: auditIntegrationEvents(trail, {
      registry: auditedEvents,
      clock: source.clock,
      ids: source.ids,
      processed: processedEvents,
      unitOfWork,
      scope: source.scope,
      consumer,
    }),
    consumer,
  };
}

/** The schema the models of the trail declare in prisma/schema/schema.prisma (`@@schema("audit")`). */
const AUDIT_SCHEMA = 'audit';

function createAuditTrail(persistence: Persistence): AuditTrail & AuditReader & ArchivableAuditTrail {
  return new PrismaAuditTrail(persistence.database, { schema: AUDIT_SCHEMA, chainOf: chainOfStream });
}
