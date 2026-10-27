import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditPolicyPermissions } from '@/contexts/credit-policy/credit-policy.permissions';
import { PublishLegalMaximumRateCommand } from '@/contexts/credit-policy/application/commands/publish-legal-maximum-rate/publish-legal-maximum-rate.command';
import { PublishLegalMaximumRateHandler } from '@/contexts/credit-policy/application/commands/publish-legal-maximum-rate/publish-legal-maximum-rate.handler';
import { aLegalMaximumRate } from '@/contexts/credit-policy/test/builders/legal-maximum-rate.builder';
import { FakeLegalMaximumRateRepository } from '@/contexts/credit-policy/test/fakes/legal-maximum-rate.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditPolicyPermissions['legal-maximum-rate.publish']] },
  }),
  map: AuthorizationMap.of(
    requires(PublishLegalMaximumRateCommand, creditPolicyPermissions['legal-maximum-rate.publish']),
  ),
});

const holder = anActor().withRole('holder').build();
const effectiveFrom = new Date('2026-07-01T00:00:00.000Z');
const carRate = { category: 'car', rateBasisPoints: 1450, effectiveFrom };

describe('Publish legal maximum rate', () => {
  it('saves the legal maximum rate of the category from its day of effect and answers its identifier', async () => {
    const { commandBus, legalMaximumRateRepository } = arrange();

    const id = await commandBus.execute(new PublishLegalMaximumRateCommand(holder, carRate));

    const stored = await legalMaximumRateRepository.findById(id);

    expect(id).toBe('legal-maximum-rate-1');
    expect(stored?.category).toBe('car');
    expect(stored?.rateBasisPoints).toBe(1450);
    expect(stored?.effectiveFrom).toEqual(effectiveFrom);
  });

  it('announces the publication of the legal maximum rate once it is saved', async () => {
    const { commandBus, domainEvents } = arrange();
    const announced: string[] = [];

    domainEvents.on('credit-policy.legal-maximum-rate.published', async (event) => {
      announced.push(event.aggregateId);
    });

    const id = await commandBus.execute(new PublishLegalMaximumRateCommand(holder, carRate));

    expect(announced).toEqual([id]);
  });

  it('accepts a rate taking effect on the day the latest rate of its category takes effect', async () => {
    const { commandBus, legalMaximumRateRepository } = arrange();

    const latest = aLegalMaximumRate()
      .identifiedBy('legal-maximum-rate-latest')
      .forCategory('car')
      .takingEffectOn(effectiveFrom)
      .build();

    await legalMaximumRateRepository.save(latest);

    const id = await commandBus.execute(new PublishLegalMaximumRateCommand(holder, carRate));

    expect(await legalMaximumRateRepository.findById(id)).toBeDefined();
  });

  it('refuses a rate taking effect before the latest rate of its category, and saves nothing', async () => {
    const { commandBus, legalMaximumRateRepository } = arrange();

    const latest = aLegalMaximumRate()
      .identifiedBy('legal-maximum-rate-latest')
      .forCategory('car')
      .takingEffectOn(new Date('2026-10-01T00:00:00.000Z'))
      .build();

    await legalMaximumRateRepository.save(latest);

    const command = new PublishLegalMaximumRateCommand(holder, carRate);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'INVALID_LEGAL_MAXIMUM_RATE' });
    expect(legalMaximumRateRepository.count()).toBe(1);
  });

  it('is refused to an actor who does not hold the permission legal-maximum-rate.publish', async () => {
    const { commandBus } = arrange();
    const command = new PublishLegalMaximumRateCommand(anActor().build(), carRate);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange() {
  const { commandBus, clock, ids, dispatching, domainEvents } = createTestBuses({ idPrefix: 'legal-maximum-rate' });
  // As the application hands it to the handler: the save announces the events of the legal maximum rate to `domainEvents`.
  const legalMaximumRateRepository = dispatching(new FakeLegalMaximumRateRepository());

  const handler = new PublishLegalMaximumRateHandler(legalMaximumRateRepository, ids, clock);

  commandBus.use(holders).register(PublishLegalMaximumRateCommand, handler);

  return { commandBus, legalMaximumRateRepository, domainEvents };
}
