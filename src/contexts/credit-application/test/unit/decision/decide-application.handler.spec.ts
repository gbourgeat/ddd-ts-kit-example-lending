import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { DecideApplicationCommand } from '@/contexts/credit-application/decision/application/commands/decide-application/decide-application.command';
import { DecideApplicationHandler } from '@/contexts/credit-application/decision/application/commands/decide-application/decide-application.handler';
import { DeciderLimitReader } from '@/contexts/credit-application/decision/application/services/decider-limit-reader';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';
import { FakeDeciderLevels } from '@/contexts/credit-application/test/fakes/decider-levels.fake';
import { FakeDelegationTables } from '@/contexts/credit-application/test/fakes/delegation-tables.fake';
import { Money } from '@/shared-kernel/money.vo';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.decide']] },
  }),
  map: AuthorizationMap.of(requires(DecideApplicationCommand, creditApplicationPermissions['application.decide'])),
});

const holder = anActor().withRole('holder').build();
const APPLICATION_ID = 'credit-application-1';
const approval = { outcome: 'approve', reasons: '', conditions: '', approvedAmountCents: 0 } as const;

describe('Decide application', () => {
  it('refuses a decision on an application that does not exist, by its code', async () => {
    const { commandBus } = arrange();

    const command = new DecideApplicationCommand(holder, APPLICATION_ID, approval);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'UNKNOWN_CREDIT_APPLICATION' });
  });

  it('refuses a decider whose level is not known, by its code', async () => {
    const { commandBus, creditApplicationRepository } = arrange();

    await saveApplication(creditApplicationRepository);

    const command = new DecideApplicationCommand(holder, APPLICATION_ID, approval);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'UNKNOWN_DECIDER_LEVEL' });
  });

  it('is refused to an actor who does not hold the permission application.decide', async () => {
    const { commandBus } = arrange();
    const command = new DecideApplicationCommand(anActor().build(), APPLICATION_ID, approval);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'credit-application' });
  // As the application hands it to the handler: the save announces the events of the credit application.
  const creditApplicationRepository = dispatching(new FakeCreditApplicationRepository());
  const deciderLimits = new DeciderLimitReader(new FakeDeciderLevels(), new FakeDelegationTables());

  const handler = new DecideApplicationHandler(creditApplicationRepository, deciderLimits, clock);

  commandBus.use(holders).register(DecideApplicationCommand, handler);

  return { commandBus, creditApplicationRepository };
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
