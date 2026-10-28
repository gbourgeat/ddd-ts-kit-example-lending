import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { stampOf, type Actor } from '@ddd-ts-kit/kernel';
import { productDefinedV2 } from '@/contexts/credit-policy/published-language';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { KeepProductTermsCommand } from '@/contexts/credit-application/file/application/commands/keep-product-terms/keep-product-terms.command';
import { KeepProductTermsHandler } from '@/contexts/credit-application/file/application/commands/keep-product-terms/keep-product-terms.handler';
import { productTermsRowOf } from '@/contexts/credit-application/file/application/projections/product-terms-row-of.projection';
import { FakeProductTerms } from '@/contexts/credit-application/test/fakes/product-terms.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['product-terms.keep']] },
  }),
  map: AuthorizationMap.of(requires(KeepProductTermsCommand, creditApplicationPermissions['product-terms.keep'])),
});

const holder = anActor().withRole('holder').build();

describe('Keep product terms', () => {
  it('keeps the terms of the product in the read model', async () => {
    const { commandBus, terms } = arrange();

    await commandBus.execute(keepCommand(holder, definedProduct('product-1', '2026-01-01T00:00:00.000Z', 100_000)));

    expect(await terms.get('product-1')).toMatchObject({ productId: 'product-1', amountMinimumCents: 100_000 });
  });

  it('keeps the same terms when the same event is delivered twice', async () => {
    const { commandBus, terms } = arrange();
    const command = keepCommand(holder, definedProduct('product-1', '2026-01-01T00:00:00.000Z', 100_000));

    await commandBus.execute(command);
    await commandBus.execute(command);

    expect(await terms.get('product-1')).toMatchObject({ amountMinimumCents: 100_000 });
  });

  it('keeps the newest terms when older ones arrive late', async () => {
    const { commandBus, terms } = arrange();

    await commandBus.execute(keepCommand(holder, definedProduct('product-1', '2026-02-01T00:00:00.000Z', 200_000)));
    await commandBus.execute(keepCommand(holder, definedProduct('product-1', '2026-01-01T00:00:00.000Z', 100_000)));

    expect(await terms.get('product-1')).toMatchObject({ amountMinimumCents: 200_000 });
  });

  it('is refused to an actor who does not hold the permission product-terms.keep, and keeps nothing', async () => {
    const { commandBus, terms } = arrange();
    const command = keepCommand(anActor().build(), definedProduct('product-1', '2026-01-01T00:00:00.000Z', 100_000));

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(await terms.get('product-1')).toBeUndefined();
  });
});

function arrange() {
  const { commandBus } = createTestBuses();
  const terms = new FakeProductTerms();

  commandBus.use(holders).register(KeepProductTermsCommand, new KeepProductTermsHandler(terms));

  return { commandBus, terms };
}

function definedProduct(productId: string, occurredAt: string, amountMinimumCents: number) {
  return productDefinedV2.create(
    {
      productId,
      amountMinimumCents,
      amountMaximumCents: 2_500_000,
      durationMinimumMonths: 12,
      durationMaximumMonths: 84,
      arrangementFeeCents: 4_500,
      insuranceMandatory: true,
    },
    { id: `event-${productId}-${occurredAt}`, occurredAt },
  );
}

function keepCommand(actor: Actor, event: ReturnType<typeof definedProduct>): KeepProductTermsCommand {
  return new KeepProductTermsCommand(actor, productTermsRowOf(event.payload), stampOf(event));
}
