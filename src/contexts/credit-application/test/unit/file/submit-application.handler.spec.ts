import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { InMemoryRelationTupleStore, RelationBasedAuthorizer } from '@ddd-ts-kit/auth/rebac';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { Money } from '@/shared-kernel/money.vo';
import { relationshipSchema } from '@/platform/auth/relationships/relationship-schema';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';
import { SubmitApplicationCommand } from '@/contexts/credit-application/file/application/commands/submit-application/submit-application.command';
import { SubmitApplicationHandler } from '@/contexts/credit-application/file/application/commands/submit-application/submit-application.handler';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';

const ada = anActor().named('ada').build();

describe('Submit application', () => {
  it('stores the application with its applicant, amount and duration, and announces the submission with the save', async () => {
    const { commandBus, creditApplicationRepository, announced } = await arrange();

    const id = await commandBus.execute(new SubmitApplicationCommand(ada, 1234567, 60));
    const stored = await creditApplicationRepository.findById(id);

    expect(id).toBe('credit-application-1');
    expect(stored?.applicantId).toBe('ada');
    expect(stored?.amount).toEqual(Money.ofCents(1234567));
    expect(stored?.durationMonths).toBe(60);
    expect(announced).toHaveLength(1);

    expect(announced[0]).toMatchObject({
      aggregateId: id,
      applicantId: 'ada',
      amount: Money.ofCents(1234567),
      durationMonths: 60,
    });
  });

  it.each([0, -1, 12.5])(
    'refuses a requested amount of %p cents as INVALID_AMOUNT, and saves and announces nothing',
    async (cents) => {
      const { commandBus, creditApplicationRepository, announced } = await arrange();

      await expect(commandBus.execute(new SubmitApplicationCommand(ada, cents, 60))).rejects.toMatchObject({
        code: 'INVALID_AMOUNT',
      });

      expect(await creditApplicationRepository.findById('credit-application-1')).toBeUndefined();
      expect(announced).toHaveLength(0);
    },
  );

  it.each([0, -3, 2.5])(
    'refuses a duration of %p months as INVALID_DURATION, and saves and announces nothing',
    async (months) => {
      const { commandBus, creditApplicationRepository, announced } = await arrange();

      await expect(commandBus.execute(new SubmitApplicationCommand(ada, 1234567, months))).rejects.toMatchObject({
        code: 'INVALID_DURATION',
      });

      expect(await creditApplicationRepository.findById('credit-application-1')).toBeUndefined();
      expect(announced).toHaveLength(0);
    },
  );

  it('is refused to an actor who is not the customer it is submitted for, and saves and announces nothing', async () => {
    const { commandBus, creditApplicationRepository, announced } = await arrange();
    const stranger = anActor().named('carl').build();

    await expect(commandBus.execute(new SubmitApplicationCommand(stranger, 1234567, 60))).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });

    expect(await creditApplicationRepository.findById('credit-application-1')).toBeUndefined();
    expect(announced).toHaveLength(0);
  });
});

/** The customer `ada` holds `self` on her own customer record: the schema derives application.submit from it. */
async function arrange() {
  const { commandBus, clock, ids, dispatching, domainEvents } = createTestBuses({ idPrefix: 'credit-application' });
  const creditApplicationRepository = dispatching(new FakeCreditApplicationRepository());
  const announced: unknown[] = [];

  domainEvents.on(CreditApplicationSubmitted.eventName, async (event) => {
    announced.push(event);
  });

  const store = new InMemoryRelationTupleStore();

  await store.write([{ object: 'customer:ada', relation: 'self', subject: 'user:ada' }]);

  const holders = authorizationMiddleware({
    authorizer: new RelationBasedAuthorizer({ schema: relationshipSchema, store }),
    map: AuthorizationMap.of(
      requires(SubmitApplicationCommand, creditApplicationPermissions['application.submit'], {
        resource: (command) => ({ type: 'customer', id: command.actor.id }),
      }),
    ),
  });

  const handler = new SubmitApplicationHandler(creditApplicationRepository, ids, clock);

  commandBus.use(holders).register(SubmitApplicationCommand, handler);

  return { commandBus, creditApplicationRepository, announced };
}
