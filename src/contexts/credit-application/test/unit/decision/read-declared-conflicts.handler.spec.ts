import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { Money } from '@/shared-kernel/money.vo';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { ReadDeclaredConflictsHandler } from '@/contexts/credit-application/decision/application/queries/read-declared-conflicts/read-declared-conflicts.handler';
import { ReadDeclaredConflictsQuery } from '@/contexts/credit-application/decision/application/queries/read-declared-conflicts/read-declared-conflicts.query';
import { FakeDeclaredConflictsStore } from '@/contexts/credit-application/test/fakes/declared-conflicts-store.fake';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';

const APPLICATION_ID = 'credit-application-1';
const registeredAt = new Date('2026-03-01T10:00:00.000Z');
const declaredAt = new Date('2026-01-10T09:00:00.000Z');

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.decide']] },
  }),
  map: AuthorizationMap.of(requires(ReadDeclaredConflictsQuery, creditApplicationPermissions['application.decide'])),
});

const decider = anActor().withRole('holder').build();

describe('Read declared conflicts', () => {
  it('answers the conflicts declared on the applicant of the application', async () => {
    const { queryBus, declaredConflicts } = await arrange();

    await declaredConflicts.keep(conflict('conflict-1', 'staff-1', 'ada'), stamp('event-1'));

    const answer = await queryBus.execute(new ReadDeclaredConflictsQuery(decider, APPLICATION_ID));

    expect(answer.conflicts).toEqual([conflict('conflict-1', 'staff-1', 'ada')]);
  });

  it('leaves out the conflicts declared on another customer than the applicant', async () => {
    const { queryBus, declaredConflicts } = await arrange();

    await declaredConflicts.keep(conflict('conflict-1', 'staff-1', 'ada'), stamp('event-1'));
    await declaredConflicts.keep(conflict('conflict-2', 'staff-2', 'grace'), stamp('event-2'));

    const answer = await queryBus.execute(new ReadDeclaredConflictsQuery(decider, APPLICATION_ID));

    expect(answer.conflicts.map((item) => item.conflictOfInterestId)).toEqual(['conflict-1']);
  });

  it('answers no conflict when none was declared on the applicant', async () => {
    const { queryBus } = await arrange();

    const answer = await queryBus.execute(new ReadDeclaredConflictsQuery(decider, APPLICATION_ID));

    expect(answer.conflicts).toEqual([]);
  });

  it('refuses an application that does not exist, as UNKNOWN_CREDIT_APPLICATION', async () => {
    const { queryBus } = await arrange();

    await expect(
      queryBus.execute(new ReadDeclaredConflictsQuery(decider, 'credit-application-unknown')),
    ).rejects.toMatchObject({ code: CreditApplicationCodes.UnknownCreditApplication });
  });

  it('is refused to an actor who does not hold the permission application.decide', async () => {
    const { queryBus } = await arrange();
    const query = new ReadDeclaredConflictsQuery(anActor().build(), APPLICATION_ID);

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

/** An application of ada, submitted earlier, and the declared conflicts store of the context. */
async function arrange() {
  const { queryBus } = createTestBuses();
  const creditApplicationRepository = new FakeCreditApplicationRepository();
  const declaredConflicts = new FakeDeclaredConflictsStore();

  await creditApplicationRepository.save(
    CreditApplication.create(APPLICATION_ID, 'ada', {
      amount: Money.ofCents(1234567),
      durationMonths: 60,
      registeredAt,
      branchId: 'branch-1',
    }),
  );

  const handler = new ReadDeclaredConflictsHandler(declaredConflicts, creditApplicationRepository);

  return { queryBus: queryBus.use(holders).register(ReadDeclaredConflictsQuery, handler), declaredConflicts };
}

function conflict(conflictOfInterestId: string, staffMemberId: string, customerId: string) {
  return { conflictOfInterestId, staffMemberId, customerId };
}

function stamp(eventId: string) {
  return { eventId, occurredAt: declaredAt };
}
