import { executionContext, FixedExecutionScope, PersonalDataCipher, type Actor } from '@ddd-ts-kit/kernel';
import type { HttpClient } from '@ddd-ts-kit/testing/e2e';
import { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';
import { EventStoreLoanRepository } from '@/contexts/servicing/ledger/infrastructure/persistence/event-store-loan.repository';
import type { RunningApplication } from '$test/e2e/support/start-application';

/** The tenant the operators of this file act for: the streams of a loan keep the tenant that first wrote them. */
const TENANT = 'acme-bank';

/** Stores a loan paid out at `paidOutAt` in the event store of the application, through the loan's own repository. */
export async function storePaidOutLoan(application: RunningApplication, id: string, paidOutAt: Date): Promise<void> {
  const stores = application.persistence.eventSourcing(seedingScope());
  const loans = new EventStoreLoanRepository(stores.events, new PersonalDataCipher(stores.subjectKeys));

  await loans.save(Loan.create(id, paidOutAt));
}

/** A signed-in person who operates the context servicing, as the operators of the context are granted. */
export async function servicingOperator(application: RunningApplication, id: string): Promise<HttpClient> {
  await application.relate({ object: 'context:servicing', relation: 'operator', subject: `user:${id}` });

  return application.as({ id, roles: [], tenantId: TENANT });
}

/** The stored events of the application, as text: a spec looks for the names and the personal values it expects. */
export async function storedEventsText(application: RunningApplication): Promise<string> {
  const events = application.persistence.eventSourcing(seedingScope()).events;

  return JSON.stringify(await events.readAll(0, 100));
}

/** The work of the seeding, in the tenant the operators act for, so that the stream is the one their requests read. */
function seedingScope(): FixedExecutionScope {
  const actor: Actor = { id: `seed-of-${TENANT}`, type: 'user', tenantId: TENANT, roles: [], attributes: {} };

  return new FixedExecutionScope(executionContext({ correlationId: 'servicing-spec', actor, origin: 'test' }));
}
