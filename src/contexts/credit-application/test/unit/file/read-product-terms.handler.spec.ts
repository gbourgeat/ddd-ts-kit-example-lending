import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { stampOf } from '@ddd-ts-kit/kernel';
import { productDefinedV2 } from '@/contexts/credit-policy/published-language';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { ReadProductTermsHandler } from '@/contexts/credit-application/file/application/queries/read-product-terms/read-product-terms.handler';
import { ReadProductTermsQuery } from '@/contexts/credit-application/file/application/queries/read-product-terms/read-product-terms.query';
import { productTermsRowOf } from '@/contexts/credit-application/file/application/projections/product-terms-row-of.projection';
import { FakeProductTerms } from '@/contexts/credit-application/test/fakes/product-terms.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.decide']] },
  }),
  map: AuthorizationMap.of(requires(ReadProductTermsQuery, creditApplicationPermissions['application.decide'])),
});

const holder = anActor().withRole('holder').build();

describe('Read product terms', () => {
  it('answers the terms of the product asked for', async () => {
    const terms = new FakeProductTerms();

    await keep(terms, 'product-1');
    await keep(terms, 'product-2');
    const queryBus = arrange(terms);

    expect(await queryBus.execute(new ReadProductTermsQuery(holder, 'product-2'))).toEqual({
      productId: 'product-2',
      amountMinimumCents: 100_000,
      amountMaximumCents: 2_500_000,
      durationMinimumMonths: 12,
      durationMaximumMonths: 84,
      arrangementFeeCents: 4_500,
      insuranceMandatory: true,
    });
  });

  it('refuses to answer terms that were never kept, with UNKNOWN_PRODUCT_TERMS', async () => {
    const queryBus = arrange(new FakeProductTerms());

    await expect(queryBus.execute(new ReadProductTermsQuery(holder, 'product-9'))).rejects.toMatchObject({
      code: 'UNKNOWN_PRODUCT_TERMS',
    });
  });

  it('is refused to an actor who does not hold the permission application.decide', async () => {
    const queryBus = arrange(new FakeProductTerms());
    const query = new ReadProductTermsQuery(anActor().build(), 'product-1');

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange(terms: FakeProductTerms) {
  const { queryBus } = createTestBuses();

  return queryBus.use(holders).register(ReadProductTermsQuery, new ReadProductTermsHandler(terms));
}

async function keep(terms: FakeProductTerms, productId: string): Promise<void> {
  const event = productDefinedV2.create(
    {
      productId,
      amountMinimumCents: 100_000,
      amountMaximumCents: 2_500_000,
      durationMinimumMonths: 12,
      durationMaximumMonths: 84,
      arrangementFeeCents: 4_500,
      insuranceMandatory: true,
    },
    { id: `event-${productId}`, occurredAt: '2026-01-01T00:00:00.000Z' },
  );

  await terms.upsertIfNewer(productId, stampOf(event), () => productTermsRowOf(event.payload));
}
