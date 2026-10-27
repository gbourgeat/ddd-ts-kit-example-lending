import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { Money } from '@/shared-kernel/money.vo';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { CreditApplicationAccountConsentGiven } from '@/contexts/credit-application/file/domain/events/credit-application-account-consent-given.event';
import { GiveAccountConsentCommand } from '@/contexts/credit-application/file/application/commands/give-account-consent/give-account-consent.command';
import { GiveAccountConsentHandler } from '@/contexts/credit-application/file/application/commands/give-account-consent/give-account-consent.handler';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const APPLICATION_ID = 'credit-application-1';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.consent']] },
  }),
  map: AuthorizationMap.of(requires(GiveAccountConsentCommand, creditApplicationPermissions['application.consent'])),
});

const applicant = anActor().withRole('holder').build();

describe('Give account consent', () => {
  it('stores the consent on the application at the instant it is given, and announces it with its expiry', async () => {
    const { commandBus, creditApplicationRepository, clock, announced } = await arrange();
    const givenAt = clock.now();

    const id = await commandBus.execute(new GiveAccountConsentCommand(applicant, APPLICATION_ID));
    const stored = await creditApplicationRepository.findById(id);

    expect(id).toBe(APPLICATION_ID);
    expect(stored?.hasValidAccountConsentAt(givenAt)).toBe(true);
    expect(announced).toHaveLength(1);

    expect(announced[0]).toMatchObject({
      aggregateId: APPLICATION_ID,
      occurredAt: givenAt,
      expiresAt: new Date(givenAt.getTime() + 90 * MILLISECONDS_PER_DAY),
    });
  });

  it('keeps the consent valid on the 89th day after it is given, and no longer valid on the 90th', async () => {
    const { commandBus, creditApplicationRepository, clock } = await arrange();

    await commandBus.execute(new GiveAccountConsentCommand(applicant, APPLICATION_ID));
    clock.advance(89 * MILLISECONDS_PER_DAY);
    const onTheEightyNinthDay = await creditApplicationRepository.findById(APPLICATION_ID);

    clock.advance(MILLISECONDS_PER_DAY);
    const onTheExpiryDay = await creditApplicationRepository.findById(APPLICATION_ID);

    expect(onTheEightyNinthDay?.hasValidAccountConsentAt(clock.now())).toBe(false);
    expect(onTheExpiryDay?.hasValidAccountConsentAt(clock.now())).toBe(false);
  });

  it('refuses a consent for an application that does not exist, as UNKNOWN_CREDIT_APPLICATION, and saves and announces nothing', async () => {
    const { commandBus, creditApplicationRepository, announced } = await arrange();

    await expect(
      commandBus.execute(new GiveAccountConsentCommand(applicant, 'credit-application-404')),
    ).rejects.toMatchObject({ code: 'UNKNOWN_CREDIT_APPLICATION' });

    expect(await creditApplicationRepository.findById('credit-application-404')).toBeUndefined();
    expect(announced).toHaveLength(0);
  });

  it('is refused to an actor who does not hold the permission application.consent', async () => {
    const { commandBus } = await arrange();
    const command = new GiveAccountConsentCommand(anActor().build(), APPLICATION_ID);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

/** An application submitted earlier, saved before the consent is given; the fake clock stands for the day of the consent. */
async function arrange() {
  const { commandBus, clock, dispatching, domainEvents } = createTestBuses({ idPrefix: 'credit-application' });
  const creditApplicationRepository = dispatching(new FakeCreditApplicationRepository());
  const announced: unknown[] = [];

  domainEvents.on(CreditApplicationAccountConsentGiven.eventName, async (event) => {
    announced.push(event);
  });

  await creditApplicationRepository.save(
    CreditApplication.create(APPLICATION_ID, 'ada', {
      amount: Money.ofCents(1234567),
      durationMonths: 60,
      registeredAt: clock.now(),
    }),
  );

  const handler = new GiveAccountConsentHandler(creditApplicationRepository, clock);

  commandBus.use(holders).register(GiveAccountConsentCommand, handler);

  return { commandBus, creditApplicationRepository, clock, announced };
}
