import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { DecideReschedulingCommand } from '@/contexts/credit-application/decision/application/commands/decide-rescheduling/decide-rescheduling.command';
import { DecideReschedulingHandler } from '@/contexts/credit-application/decision/application/commands/decide-rescheduling/decide-rescheduling.handler';
import { DeciderLimitReader } from '@/contexts/credit-application/decision/application/projections/decider-limit-reader.projection';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';
import { FakeDeciderLevels } from '@/contexts/credit-application/test/fakes/decider-levels.fake';
import { FakeDelegationTables } from '@/contexts/credit-application/test/fakes/delegation-tables.fake';
import { FakeDeclaredConflictsStore } from '@/contexts/credit-application/test/fakes/declared-conflicts-store.fake';
import { Money } from '@/shared-kernel/money.vo';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.reschedule']] },
  }),
  map: AuthorizationMap.of(requires(DecideReschedulingCommand, creditApplicationPermissions['application.reschedule'])),
});

const holder = anActor().withRole('holder').build();
const APPLICATION_ID = 'credit-application-1';
const rescheduling = { durationMonths: 48, outstandingAmountCents: 1_000_000 };

describe('Decide rescheduling', () => {
  it('refuses a rescheduling of an application that does not exist, by its code', async () => {
    const { commandBus } = arrange();

    const command = new DecideReschedulingCommand(holder, APPLICATION_ID, 48, 1_000_000);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'UNKNOWN_CREDIT_APPLICATION' });
  });

  it('refuses a rescheduling of an application that is not approved, by its code', async () => {
    const { commandBus, creditApplicationRepository, seed } = arrange();

    await saveApplication(creditApplicationRepository);
    await seed.decider(holder.id);

    const command = new DecideReschedulingCommand(
      holder,
      APPLICATION_ID,
      rescheduling.durationMonths,
      rescheduling.outstandingAmountCents,
    );

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'RESCHEDULING_NOT_APPROVED' });
  });

  it('refuses a decider who declared a conflict on the applicant, by its code', async () => {
    const { commandBus, creditApplicationRepository, seed } = arrange();

    await saveApplication(creditApplicationRepository);
    await seed.decider(holder.id);
    await seed.conflictOn(holder.id, 'applicant-1');

    const command = new DecideReschedulingCommand(
      holder,
      APPLICATION_ID,
      rescheduling.durationMonths,
      rescheduling.outstandingAmountCents,
    );

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'CONFLICTED_DECIDER' });
  });

  it('is refused to an actor who does not hold the permission application.reschedule', async () => {
    const { commandBus } = arrange();
    const command = new DecideReschedulingCommand(anActor().build(), APPLICATION_ID, 48, 1_000_000);

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

  const handler = new DecideReschedulingHandler(creditApplicationRepository, deciderLimits, clock, declaredConflicts);

  commandBus.use(holders).register(DecideReschedulingCommand, handler);

  return { commandBus, creditApplicationRepository, seed: seedOf(deciderLevels, delegationTables, declaredConflicts) };
}

/** The read models the decider needs: its level, the table in force, and the conflicts declared on the applicant. */
function seedOf(
  deciderLevels: FakeDeciderLevels,
  delegationTables: FakeDelegationTables,
  declaredConflicts: FakeDeclaredConflictsStore,
) {
  const stamp = { eventId: 'event-1', occurredAt: new Date('2020-01-01T00:00:00.000Z') };

  return {
    async decider(staffMemberId: string): Promise<void> {
      await deciderLevels.upsertIfNewer(staffMemberId, stamp, () => ({
        staffMemberId,
        branchId: 'branch-1',
        level: 'credit-committee',
      }));

      await delegationTables.upsertIfNewer('table-1', stamp, () => ({
        delegationTableId: 'table-1',
        effectiveFrom: new Date('2020-01-01T00:00:00.000Z'),
        levels: [{ level: 'credit-committee', amountCents: 100_000_000 }],
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
