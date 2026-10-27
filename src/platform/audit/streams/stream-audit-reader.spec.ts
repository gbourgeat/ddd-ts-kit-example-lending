import { beforeEach, describe, expect, it } from '@jest/globals';
import { InMemoryRelationTupleStore, RelationBasedAuthorizer } from '@ddd-ts-kit/auth/rebac';
import { InMemoryAuditTrail, TenantAuditReader, auditDecisions, type AuthorizationDecision } from '@ddd-ts-kit/audit';
import {
  FixedClock,
  FixedExecutionScope,
  SequentialIdGenerator,
  cursorPage,
  executionContext,
  type Actor,
  type AuditEntry,
  type ExecutionScope,
} from '@ddd-ts-kit/kernel';
import { relationshipSchema } from '@/platform/auth/relationships/relationship-schema';
import { SearchAuditEntriesHandler } from '@/platform/audit/search-audit-entries/search-audit-entries.handler';
import { SearchAuditEntriesQuery } from '@/platform/audit/search-audit-entries/search-audit-entries.query';
import { chainOfStream } from '@/platform/audit/streams/chain-of-stream';
import { StreamAuditReader } from '@/platform/audit/streams/stream-audit-reader';

const acme = 'acme';
const compliance: Actor = actorNamed('cora');
const auditor: Actor = actorNamed('ada');
const branchManager: Actor = actorNamed('bob');
const financialCrime = { type: 'context', id: 'financial-crime' };

describe('the audit stream of financial crime, read by compliance only', () => {
  let trail: InMemoryAuditTrail;
  let authorizer: RelationBasedAuthorizer;

  beforeEach(async () => {
    trail = new InMemoryAuditTrail({ chainOf: chainOfStream });

    const store = new InMemoryRelationTupleStore();

    authorizer = new RelationBasedAuthorizer({ schema: relationshipSchema, store });

    await store.write([
      { object: 'context:financial-crime', relation: 'operator', subject: 'user:cora' },
      { object: 'context:audit', relation: 'operator', subject: 'user:ada' },
    ]);

    await decide(compliance, { permissionId: 'financial-crime:alert.close', resource: financialCrime, allowed: true });

    await decide(branchManager, {
      permissionId: 'financial-crime:alert.raise',
      resource: financialCrime,
      allowed: false,
      reason: 'NO_MATCHING_ROLE',
    });

    await decide(auditor, { permissionId: 'audit:trail.read', allowed: true });
  });

  it('shows the entries of financial crime to compliance, with the rest of the trail', async () => {
    const actions = (await searchAs(compliance)).map((entry) => entry.action);

    expect(actions).toEqual(expect.arrayContaining(['financial-crime:alert.close', 'financial-crime:alert.raise']));
    expect(actions).toContain('audit:trail.read');
  });

  it('leaves the entries of financial crime out for whoever reads the trail without being compliance', async () => {
    const actions = (await searchAs(auditor)).map((entry) => entry.action);

    expect(actions).toEqual(['audit:trail.read']);
  });

  it('keeps the entries of financial crime in a chain of their own, per tenant', () => {
    const streamed = trail.entries.filter((entry) => entry.context === 'financial-crime');

    expect(streamed).toHaveLength(2);
    expect(streamed.every((entry) => entry.chain === `stream:financial-crime:tenant:${acme}`)).toBe(true);
  });

  const searchAs = (actor: Actor): Promise<AuditEntry[]> => {
    const scope = scopeOf(actor);
    const reader = new StreamAuditReader(new TenantAuditReader(trail, scope), scope, authorizer);

    return new SearchAuditEntriesHandler(reader)
      .execute(
        new SearchAuditEntriesQuery(
          actor,
          cursorPage({ limit: 50, sort: [{ field: 'occurredAt', direction: 'desc' }] }),
        ),
      )
      .then((page) => [...page.items]);
  };

  const decide = (actor: Actor, decision: AuthorizationRecord): Promise<void> =>
    auditDecisions(trail, {
      scope: scopeOf(actor),
      clock: new FixedClock(new Date('2026-10-26T10:00:00.000Z')),
      ids: new SequentialIdGenerator('audit'),
    })(decisionOf(actor, decision));
});

type AuthorizationRecord =
  | { permissionId: string; resource?: { type: string; id: string }; allowed: true }
  | { permissionId: string; resource?: { type: string; id: string }; allowed: false; reason: string };

function decisionOf(actor: Actor, record: AuthorizationRecord): AuthorizationDecision {
  const decision = record.allowed ? { allowed: true as const } : { allowed: false as const, reason: record.reason };

  return {
    actorId: actor.id,
    permissionId: record.permissionId,
    ...(record.resource === undefined ? {} : { resource: record.resource }),
    decision,
    kind: 'command',
  };
}

function scopeOf(actor: Actor): ExecutionScope {
  return new FixedExecutionScope(executionContext({ correlationId: `request-${actor.id}`, actor, origin: 'http' }));
}

function actorNamed(id: string): Actor {
  return { id, type: 'user', tenantId: acme, roles: [], attributes: {} };
}
