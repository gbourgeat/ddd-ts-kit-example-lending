import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { stampOf } from '@ddd-ts-kit/kernel';
import { rateGridPublishedV2 } from '@/contexts/credit-policy/published-language';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { ReadRateGridHandler } from '@/contexts/credit-application/offer/application/queries/read-rate-grid/read-rate-grid.handler';
import { ReadRateGridQuery } from '@/contexts/credit-application/offer/application/queries/read-rate-grid/read-rate-grid.query';
import { rateGridRowOf } from '@/contexts/credit-application/offer/application/projections/rate-grid-row-of.projection';
import { FakeRateGrids } from '@/contexts/credit-application/test/fakes/rate-grids.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.decide']] },
  }),
  map: AuthorizationMap.of(requires(ReadRateGridQuery, creditApplicationPermissions['application.decide'])),
});

const holder = anActor().withRole('holder').build();

describe('Read rate grid', () => {
  it('answers the product and the day the grid takes effect', async () => {
    const grids = new FakeRateGrids();

    await keep(grids, 'rate-grid-1');
    const queryBus = arrange(grids);

    const answer = await queryBus.execute(new ReadRateGridQuery(holder, 'rate-grid-1'));

    expect(answer).toEqual({
      rateGridId: 'rate-grid-1',
      productId: 'personal-loan',
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      rates: [],
    });
  });

  it('answers the grid asked for, not another one that is kept', async () => {
    const grids = new FakeRateGrids();

    await keep(grids, 'rate-grid-1');
    await keep(grids, 'rate-grid-2');
    const queryBus = arrange(grids);

    const answer = await queryBus.execute(new ReadRateGridQuery(holder, 'rate-grid-2'));

    expect(answer.rateGridId).toBe('rate-grid-2');
  });

  it('refuses to answer a rate grid that was never published with UNKNOWN_RATE_GRID', async () => {
    const queryBus = arrange(new FakeRateGrids());

    await expect(queryBus.execute(new ReadRateGridQuery(holder, 'rate-grid-9'))).rejects.toMatchObject({
      code: 'UNKNOWN_RATE_GRID',
    });
  });

  it('is refused to an actor who does not hold the permission application.decide', async () => {
    const queryBus = arrange(new FakeRateGrids());
    const query = new ReadRateGridQuery(anActor().build(), 'rate-grid-1');

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange(grids: FakeRateGrids) {
  const { queryBus } = createTestBuses();

  return queryBus.use(holders).register(ReadRateGridQuery, new ReadRateGridHandler(grids));
}

async function keep(grids: FakeRateGrids, rateGridId: string): Promise<void> {
  const event = rateGridPublishedV2.create(
    { rateGridId, productId: 'personal-loan', effectiveFrom: '2026-01-01T00:00:00.000Z', rates: [] },
    { id: `event-${rateGridId}`, occurredAt: '2026-01-01T00:00:00.000Z' },
  );

  await grids.upsertIfNewer(rateGridId, stampOf(event), () => rateGridRowOf(event.payload));
}
