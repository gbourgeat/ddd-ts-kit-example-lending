import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditPolicyPermissions } from '@/contexts/credit-policy/credit-policy.permissions';
import { DefineProductCommand } from '@/contexts/credit-policy/application/commands/define-product/define-product.command';
import { DefineProductHandler } from '@/contexts/credit-policy/application/commands/define-product/define-product.handler';
import { FakeProductRepository } from '@/contexts/credit-policy/test/fakes/product.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditPolicyPermissions['product.define']] },
  }),
  map: AuthorizationMap.of(requires(DefineProductCommand, creditPolicyPermissions['product.define'])),
});

const holder = anActor().withRole('holder').build();

const personalLoan = {
  amountMinimumCents: 100_000,
  amountMaximumCents: 2_500_000,
  durationMinimumMonths: 12,
  durationMaximumMonths: 84,
  arrangementFeeCents: 4_500,
  insuranceMandatory: true,
  scoreThreshold: 600,
};

describe('Define product', () => {
  it('saves the product with its amounts, durations, fee, insurance and threshold, and answers its identifier', async () => {
    const { commandBus, productRepository } = arrange();

    const id = await commandBus.execute(new DefineProductCommand(holder, personalLoan));

    const stored = await productRepository.findById(id);

    expect(id).toBe('product-1');
    expect(stored?.amountMaximumCents).toBe(2_500_000);
    expect(stored?.durationMaximumMonths).toBe(84);
    expect(stored?.arrangementFeeCents).toBe(4_500);
    expect(stored?.insuranceMandatory).toBe(true);
    expect(stored?.scoreThreshold).toBe(600);
  });

  it('announces the definition of the product once it is saved', async () => {
    const { commandBus, domainEvents } = arrange();
    const announced: string[] = [];

    domainEvents.on('credit-policy.product.defined', async (event) => {
      announced.push(event.aggregateId);
    });

    const id = await commandBus.execute(new DefineProductCommand(holder, personalLoan));

    expect(announced).toEqual([id]);
  });

  it('refuses a minimum amount above the maximum with PRODUCT_BOUNDS_INVERTED and saves nothing', async () => {
    const { commandBus, productRepository } = arrange();
    const command = new DefineProductCommand(holder, { ...personalLoan, amountMinimumCents: 3_000_000 });

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'PRODUCT_BOUNDS_INVERTED' });

    expect(await productRepository.findById('product-1')).toBeUndefined();
  });

  it('refuses a minimum duration above the maximum with PRODUCT_BOUNDS_INVERTED', async () => {
    const { commandBus } = arrange();
    const command = new DefineProductCommand(holder, { ...personalLoan, durationMinimumMonths: 96 });

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'PRODUCT_BOUNDS_INVERTED' });
  });

  it('refuses a score threshold above 1000 with INVALID_SCORE_THRESHOLD', async () => {
    const { commandBus } = arrange();
    const command = new DefineProductCommand(holder, { ...personalLoan, scoreThreshold: 1001 });

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'INVALID_SCORE_THRESHOLD' });
  });

  it('is refused to an actor who does not hold the permission product.define', async () => {
    const { commandBus } = arrange();
    const command = new DefineProductCommand(anActor().build(), personalLoan);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange() {
  const { commandBus, clock, ids, dispatching, domainEvents } = createTestBuses({ idPrefix: 'product' });
  // As the application hands it to the handler: the save announces the events of the product to `domainEvents`.
  const productRepository = dispatching(new FakeProductRepository());

  const handler = new DefineProductHandler(productRepository, ids, clock);

  commandBus.use(holders).register(DefineProductCommand, handler);

  return { commandBus, productRepository, domainEvents };
}
