import {
  dataSubjectErasedV1,
  eachTenant,
  eraseDataSubject,
  executionContext,
  inEachTenant,
  type Actor,
  type DataSubjectErasureReport,
} from '@ddd-ts-kit/kernel';
import type { Platform } from '@/platform/composition/platform';
import { dataSubjectCopies } from '@/platform/privacy/data-subject-copies';

export interface ErasureRequest {
  /** The assembled platform: the keys, the scope and the copies come from it. */
  readonly platform: Platform;
  /** Who asks for the erasure, as typed: the actor of the work, named by the entry the audited keys write. */
  readonly operator: string;
  /** The correlation of the work: one per erasure. */
  readonly correlationId: string;
  /** The tenants the deployment serves: the copies are erased in each one, in an execution context of that tenant, since a write of tenant data is never widened. */
  readonly tenants: readonly string[];
}

/**
 * The right to erasure of one data subject, in an execution context of its own (origin `cli`): the
 * key first, with its audit entry, then every copy a context declared in `data-subject-copies.ts`, in
 * every tenant. Running it again completes an erasure whose entry or copy failed; a subject that is
 * not an opaque identifier is refused before any key is touched.
 */
export function runErasure(subject: string, request: ErasureRequest): Promise<DataSubjectErasureReport> {
  const { platform, operator, correlationId } = request;
  const context = executionContext({ correlationId, actor: operatorActor(operator), origin: 'cli' });

  return platform.scope.run(context, async () => {
    const report = await eraseDataSubject(subject, {
      // TODO(platform): once a projection is fed by the event store, give `rebuilds` the rebuild of each one: a projection keeps a clear copy of the person until it is rebuilt.
      keys: platform.eventSourcing.subjectKeys,
      copies: dataSubjectCopies.map((copy) => copy(platform)),
      inEveryTenant: inEachTenant(platform.scope, request.tenants),
    });

    await announceErasure(subject, request);

    return report;
  });
}

/**
 * Once every copy is erased, `privacy.data-subject.erased` goes to the outbox, once per tenant: a context that
 * runs as a service of its own, or a system that copied the person from an integration event, erases
 * its copy on its side (GDPR article 19). It names the person by id and nobody else: who asked is in
 * the audit trail, under the correlation id the event carries. The relay of the application delivers it; an erasure that
 * failed publishes nothing, and running it again does.
 */
async function announceErasure(subject: string, { platform, tenants }: ErasureRequest): Promise<void> {
  const erasedAt = platform.clock.now();
  const payload = { subjectId: subject, erasedAt: erasedAt.toISOString() };
  const event = () => dataSubjectErasedV1.create(payload, { id: platform.ids.next(), occurredAt: erasedAt });
  const publish = () => platform.publisher.publish([event()]);

  await eachTenant(platform.scope, tenants, publish);
}

function operatorActor(id: string): Actor {
  return { id, type: 'user', roles: [], attributes: {} };
}
