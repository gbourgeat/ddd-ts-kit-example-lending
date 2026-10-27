import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { Money } from '@/shared-kernel/money.vo';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { CreditApplicationCoBorrowerNamed } from '@/contexts/credit-application/file/domain/events/credit-application-co-borrower-named.event';
import { NameCoBorrowerCommand } from '@/contexts/credit-application/file/application/commands/name-co-borrower/name-co-borrower.command';
import { NameCoBorrowerHandler } from '@/contexts/credit-application/file/application/commands/name-co-borrower/name-co-borrower.handler';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';

const APPLICATION_ID = 'credit-application-1';
const CO_BORROWER_ID = 'customer-2';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.name-party']] },
  }),
  map: AuthorizationMap.of(requires(NameCoBorrowerCommand, creditApplicationPermissions['application.name-party'])),
});

const applicant = anActor().withRole('holder').build();

describe('Name co borrower', () => {
  it('stores the co-borrower on the application and answers the application identifier', async () => {
    const { commandBus, creditApplicationRepository } = await arrange();

    const id = await commandBus.execute(new NameCoBorrowerCommand(applicant, APPLICATION_ID, CO_BORROWER_ID));
    const stored = await creditApplicationRepository.findById(id);

    expect(id).toBe(APPLICATION_ID);
    expect(stored?.coBorrowerIds).toEqual([CO_BORROWER_ID]);
  });

  it('announces the co-borrower named, with the instant it was named', async () => {
    const { commandBus, clock, announced } = await arrange();
    const namedAt = clock.now();

    await commandBus.execute(new NameCoBorrowerCommand(applicant, APPLICATION_ID, CO_BORROWER_ID));

    expect(announced).toHaveLength(1);

    expect(announced[0]).toMatchObject({
      aggregateId: APPLICATION_ID,
      occurredAt: namedAt,
      coBorrowerId: CO_BORROWER_ID,
    });
  });

  it('refuses a co-borrower for an application that does not exist, as UNKNOWN_CREDIT_APPLICATION, and announces nothing', async () => {
    const { commandBus, announced } = await arrange();

    await expect(
      commandBus.execute(new NameCoBorrowerCommand(applicant, 'credit-application-404', CO_BORROWER_ID)),
    ).rejects.toMatchObject({ code: 'UNKNOWN_CREDIT_APPLICATION' });

    expect(announced).toHaveLength(0);
  });

  it('is refused to an actor who does not hold the permission application.name-party', async () => {
    const { commandBus } = await arrange();
    const command = new NameCoBorrowerCommand(anActor().build(), APPLICATION_ID, CO_BORROWER_ID);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

/** An application submitted earlier, saved before the co-borrower is named. */
async function arrange() {
  const { commandBus, clock, dispatching, domainEvents } = createTestBuses({ idPrefix: 'credit-application' });
  const creditApplicationRepository = dispatching(new FakeCreditApplicationRepository());
  const announced: unknown[] = [];

  domainEvents.on(CreditApplicationCoBorrowerNamed.eventName, async (event) => {
    announced.push(event);
  });

  await creditApplicationRepository.save(
    CreditApplication.create(APPLICATION_ID, 'ada', {
      amount: Money.ofCents(1234567),
      durationMonths: 60,
      registeredAt: clock.now(),
    }),
  );

  const handler = new NameCoBorrowerHandler(creditApplicationRepository, clock);

  commandBus.use(holders).register(NameCoBorrowerCommand, handler);

  return { commandBus, creditApplicationRepository, clock, announced };
}
