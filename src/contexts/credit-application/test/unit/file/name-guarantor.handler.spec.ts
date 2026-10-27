import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { Money } from '@/shared-kernel/money.vo';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { CreditApplicationGuarantorNamed } from '@/contexts/credit-application/file/domain/events/credit-application-guarantor-named.event';
import { NameGuarantorCommand } from '@/contexts/credit-application/file/application/commands/name-guarantor/name-guarantor.command';
import { NameGuarantorHandler } from '@/contexts/credit-application/file/application/commands/name-guarantor/name-guarantor.handler';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';

const APPLICATION_ID = 'credit-application-1';
const GUARANTOR_ID = 'customer-4';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.name-party']] },
  }),
  map: AuthorizationMap.of(requires(NameGuarantorCommand, creditApplicationPermissions['application.name-party'])),
});

const applicant = anActor().withRole('holder').build();

describe('Name guarantor', () => {
  it('stores the guarantor on the application and answers the application identifier', async () => {
    const { commandBus, creditApplicationRepository } = await arrange();

    const id = await commandBus.execute(new NameGuarantorCommand(applicant, APPLICATION_ID, GUARANTOR_ID));
    const stored = await creditApplicationRepository.findById(id);

    expect(id).toBe(APPLICATION_ID);
    expect(stored?.guarantorIds).toEqual([GUARANTOR_ID]);
  });

  it('keeps the co-borrowers apart from the guarantors of the application', async () => {
    const { commandBus, creditApplicationRepository } = await arrange();

    const id = await commandBus.execute(new NameGuarantorCommand(applicant, APPLICATION_ID, GUARANTOR_ID));
    const stored = await creditApplicationRepository.findById(id);

    expect(stored?.coBorrowerIds).toEqual([]);
  });

  it('announces the guarantor named, with the instant it was named', async () => {
    const { commandBus, clock, announced } = await arrange();
    const namedAt = clock.now();

    await commandBus.execute(new NameGuarantorCommand(applicant, APPLICATION_ID, GUARANTOR_ID));

    expect(announced).toHaveLength(1);

    expect(announced[0]).toMatchObject({
      aggregateId: APPLICATION_ID,
      occurredAt: namedAt,
      guarantorId: GUARANTOR_ID,
    });
  });

  it('refuses a guarantor for an application that does not exist, as UNKNOWN_CREDIT_APPLICATION, and announces nothing', async () => {
    const { commandBus, announced } = await arrange();

    await expect(
      commandBus.execute(new NameGuarantorCommand(applicant, 'credit-application-404', GUARANTOR_ID)),
    ).rejects.toMatchObject({ code: 'UNKNOWN_CREDIT_APPLICATION' });

    expect(announced).toHaveLength(0);
  });

  it('is refused to an actor who does not hold the permission application.name-party', async () => {
    const { commandBus } = await arrange();
    const command = new NameGuarantorCommand(anActor().build(), APPLICATION_ID, GUARANTOR_ID);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

/** An application submitted earlier, saved before the guarantor is named. */
async function arrange() {
  const { commandBus, clock, dispatching, domainEvents } = createTestBuses({ idPrefix: 'credit-application' });
  const creditApplicationRepository = dispatching(new FakeCreditApplicationRepository());
  const announced: unknown[] = [];

  domainEvents.on(CreditApplicationGuarantorNamed.eventName, async (event) => {
    announced.push(event);
  });

  await creditApplicationRepository.save(
    CreditApplication.create(APPLICATION_ID, 'ada', {
      amount: Money.ofCents(1234567),
      durationMonths: 60,
      registeredAt: clock.now(),
    }),
  );

  const handler = new NameGuarantorHandler(creditApplicationRepository, clock);

  commandBus.use(holders).register(NameGuarantorCommand, handler);

  return { commandBus, creditApplicationRepository, clock, announced };
}
