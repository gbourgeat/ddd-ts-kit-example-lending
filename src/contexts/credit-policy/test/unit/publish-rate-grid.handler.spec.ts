import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditPolicyPermissions } from '@/contexts/credit-policy/credit-policy.permissions';
import { PublishRateGridCommand } from '@/contexts/credit-policy/application/commands/publish-rate-grid/publish-rate-grid.command';
import { PublishRateGridHandler } from '@/contexts/credit-policy/application/commands/publish-rate-grid/publish-rate-grid.handler';
import { FakeRateGridRepository } from '@/contexts/credit-policy/test/fakes/rate-grid.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditPolicyPermissions['rate-grid.publish']] },
  }),
  map: AuthorizationMap.of(requires(PublishRateGridCommand, creditPolicyPermissions['rate-grid.publish'])),
});

const holder = anActor().withRole('holder').build();
const effectiveFrom = new Date('2026-11-01T00:00:00.000Z');

describe('Publish rate grid', () => {
  it('saves the rate grid of the product from its date of effect and answers its identifier', async () => {
    const { commandBus, rateGridRepository } = arrange();

    const id = await commandBus.execute(new PublishRateGridCommand(holder, 'product-1', effectiveFrom));

    const stored = await rateGridRepository.findById(id);

    expect(id).toBe('rate-grid-1');
    expect(stored?.productId).toBe('product-1');
    expect(stored?.effectiveFrom).toEqual(effectiveFrom);
  });

  it('announces the publication of the rate grid once it is saved', async () => {
    const { commandBus, domainEvents } = arrange();
    const announced: string[] = [];

    domainEvents.on('credit-policy.rate-grid.published', async (event) => {
      announced.push(event.aggregateId);
    });

    const id = await commandBus.execute(new PublishRateGridCommand(holder, 'product-1', effectiveFrom));

    expect(announced).toEqual([id]);
  });

  it('is refused to an actor who does not hold the permission rate-grid.publish', async () => {
    const { commandBus } = arrange();
    const command = new PublishRateGridCommand(anActor().build(), 'product-1', effectiveFrom);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('saves no rate grid and announces nothing when the actor lacks the permission', async () => {
    const { commandBus, rateGridRepository, domainEvents } = arrange();
    const announced: string[] = [];

    domainEvents.on('credit-policy.rate-grid.published', async (event) => {
      announced.push(event.aggregateId);
    });

    await expect(
      commandBus.execute(new PublishRateGridCommand(anActor().build(), 'product-1', effectiveFrom)),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });

    expect(await rateGridRepository.findById('rate-grid-1')).toBeUndefined();
    expect(announced).toEqual([]);
  });
});

function arrange() {
  const { commandBus, clock, ids, dispatching, domainEvents } = createTestBuses({ idPrefix: 'rate-grid' });
  // As the application hands it to the handler: the save announces the events of the rate grid to `domainEvents`.
  const rateGridRepository = dispatching(new FakeRateGridRepository());

  const handler = new PublishRateGridHandler(rateGridRepository, ids, clock);

  commandBus.use(holders).register(PublishRateGridCommand, handler);

  return { commandBus, rateGridRepository, domainEvents };
}
