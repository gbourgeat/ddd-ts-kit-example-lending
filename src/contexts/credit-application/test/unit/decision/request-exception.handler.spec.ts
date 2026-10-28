import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { RequestExceptionCommand } from '@/contexts/credit-application/decision/application/commands/request-exception/request-exception.command';
import { RequestExceptionHandler } from '@/contexts/credit-application/decision/application/commands/request-exception/request-exception.handler';
import { DeciderLimitReader } from '@/contexts/credit-application/decision/application/projections/decider-limit-reader.projection';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';
import { FakeDeciderLevels } from '@/contexts/credit-application/test/fakes/decider-levels.fake';
import { FakeDelegationTables } from '@/contexts/credit-application/test/fakes/delegation-tables.fake';
import { FakeDeclaredConflictsStore } from '@/contexts/credit-application/test/fakes/declared-conflicts-store.fake';
import { Money } from '@/shared-kernel/money.vo';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.request-exception']] },
  }),
  map: AuthorizationMap.of(
    requires(RequestExceptionCommand, creditApplicationPermissions['application.request-exception']),
  ),
});

const holder = anActor().withRole('holder').build();
const APPLICATION_ID = 'credit-application-1';
const JUSTIFICATION = 'The applicant has a stable salary and a guarantor.';
/** The advisor limit is below the amount of the application: an exception is needed. */
const ADVISOR_LIMIT_CENTS = 500_000;

describe('Request exception', () => {
  it('refuses an exception on an application that does not exist, by its code', async () => {
    const { commandBus } = arrange();

    const command = new RequestExceptionCommand(holder, APPLICATION_ID, JUSTIFICATION);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'UNKNOWN_CREDIT_APPLICATION' });
  });

  it('refuses an exception from a decider whose level is not known, by its code', async () => {
    const { commandBus, creditApplicationRepository } = arrange();

    await saveApplication(creditApplicationRepository);

    const command = new RequestExceptionCommand(holder, APPLICATION_ID, JUSTIFICATION);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'UNKNOWN_DECIDER_LEVEL' });
  });

  it('refuses an exception the limit of the decider already covers, by its code, and records nothing', async () => {
    const { commandBus, creditApplicationRepository, seed } = arrange();

    await saveApplication(creditApplicationRepository);
    await seed.decider(holder.id, 'credit-committee');

    const command = new RequestExceptionCommand(holder, APPLICATION_ID, JUSTIFICATION);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'EXCEPTION_NOT_ABOVE_LIMIT' });
    expect((await creditApplicationRepository.findById(APPLICATION_ID))?.toState().exception).toBeUndefined();
  });

  it('refuses an exception from a decider who declared a conflict on the applicant, by its code', async () => {
    const { commandBus, creditApplicationRepository, seed } = arrange();

    await saveApplication(creditApplicationRepository);
    await seed.decider(holder.id, 'advisor');
    await seed.conflictOn(holder.id, 'applicant-1');

    const command = new RequestExceptionCommand(holder, APPLICATION_ID, JUSTIFICATION);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'CONFLICTED_DECIDER' });
  });

  it('refuses an exception on an application not assessed yet, by its code', async () => {
    const { commandBus, creditApplicationRepository, seed } = arrange();

    await saveApplication(creditApplicationRepository);
    await seed.decider(holder.id, 'advisor');

    const command = new RequestExceptionCommand(holder, APPLICATION_ID, JUSTIFICATION);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'NOT_ASSESSED' });
  });

  it('records the exception to the level above the one the amount needs, with its justification', async () => {
    const { commandBus, creditApplicationRepository, seed } = arrange();

    await saveAssessedApplication(creditApplicationRepository);
    await seed.decider(holder.id, 'advisor');

    await commandBus.execute(new RequestExceptionCommand(holder, APPLICATION_ID, JUSTIFICATION));

    const stored = await creditApplicationRepository.findById(APPLICATION_ID);

    expect(stored?.toState().exception).toMatchObject({
      requesterId: holder.id,
      targetLevel: 'risk-manager',
      justification: JUSTIFICATION,
    });
  });

  it('refuses a second exception on the same application, by its code', async () => {
    const { commandBus, creditApplicationRepository, seed } = arrange();

    await saveAssessedApplication(creditApplicationRepository);
    await seed.decider(holder.id, 'advisor');
    await commandBus.execute(new RequestExceptionCommand(holder, APPLICATION_ID, JUSTIFICATION));

    const second = new RequestExceptionCommand(holder, APPLICATION_ID, JUSTIFICATION);

    await expect(commandBus.execute(second)).rejects.toMatchObject({ code: 'EXCEPTION_ALREADY_REQUESTED' });
  });

  it('refuses an exception without its justification in words, by its code, and records nothing', async () => {
    const { commandBus, creditApplicationRepository, seed } = arrange();

    await saveAssessedApplication(creditApplicationRepository);
    await seed.decider(holder.id, 'advisor');

    const command = new RequestExceptionCommand(holder, APPLICATION_ID, '   ');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'INVALID_EXCEPTION_JUSTIFICATION' });
    expect((await creditApplicationRepository.findById(APPLICATION_ID))?.toState().exception).toBeUndefined();
  });

  it('is refused to an actor who does not hold the permission application.request-exception', async () => {
    const { commandBus } = arrange();
    const command = new RequestExceptionCommand(anActor().build(), APPLICATION_ID, JUSTIFICATION);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'credit-application' });
  // As the application hands it to the handler: the save announces the events of the credit application.
  const creditApplicationRepository = dispatching(new FakeCreditApplicationRepository());
  const deciderLevels = new FakeDeciderLevels();
  const delegationTables = new FakeDelegationTables();
  const declaredConflicts = new FakeDeclaredConflictsStore();
  const deciderLimits = new DeciderLimitReader(deciderLevels, delegationTables);

  const handler = new RequestExceptionHandler(creditApplicationRepository, deciderLimits, clock, declaredConflicts);

  commandBus.use(holders).register(RequestExceptionCommand, handler);

  return {
    commandBus,
    creditApplicationRepository,
    seed: seedOf(deciderLevels, delegationTables, declaredConflicts),
  };
}

/** The read models the decider needs: its level, the table in force, and the conflicts declared on the applicant. */
function seedOf(
  deciderLevels: FakeDeciderLevels,
  delegationTables: FakeDelegationTables,
  declaredConflicts: FakeDeclaredConflictsStore,
) {
  const stamp = { eventId: 'event-1', occurredAt: new Date('2020-01-01T00:00:00.000Z') };

  return {
    async decider(staffMemberId: string, level: string): Promise<void> {
      await deciderLevels.upsertIfNewer(staffMemberId, stamp, () => ({ staffMemberId, branchId: 'branch-1', level }));

      await delegationTables.upsertIfNewer('table-1', stamp, () => ({
        delegationTableId: 'table-1',
        effectiveFrom: new Date('2020-01-01T00:00:00.000Z'),
        levels: [
          { level: 'advisor', amountCents: ADVISOR_LIMIT_CENTS },
          { level: 'credit-analyst', amountCents: 7_500_000 },
          { level: 'risk-manager', amountCents: 25_000_000 },
          { level: 'credit-committee', amountCents: 100_000_000 },
        ],
      }));
    },
    async conflictOn(staffMemberId: string, customerId: string): Promise<void> {
      await declaredConflicts.keep(
        { conflictOfInterestId: `conflict-${staffMemberId}`, staffMemberId, customerId },
        stamp,
      );
    },
  };
}

async function saveApplication(repository: FakeCreditApplicationRepository): Promise<void> {
  const application = CreditApplication.create(APPLICATION_ID, 'applicant-1', {
    amount: Money.ofCents(1_234_567),
    durationMonths: 60,
    registeredAt: new Date('2026-01-10T00:00:00.000Z'),
    branchId: '',
  });

  await repository.save(application);
}

async function saveAssessedApplication(repository: FakeCreditApplicationRepository): Promise<void> {
  const application = CreditApplication.create(APPLICATION_ID, 'applicant-1', {
    amount: Money.ofCents(1_234_567),
    durationMonths: 60,
    registeredAt: new Date('2026-01-10T00:00:00.000Z'),
    branchId: '',
  });

  application.assess(approvingAssessment, new Date('2026-02-01T00:00:00.000Z'), 'assessor-1');
  await repository.save(application);
}

const approvingAssessment = {
  modelVersion: '2026.1',
  debtToIncomePercent: 20,
  repaymentIncidents: 0,
  residualIncomeCents: 160_000,
  score: 85,
  band: 'green',
  factors: [],
  proposedOutcome: 'approve',
} as const;
