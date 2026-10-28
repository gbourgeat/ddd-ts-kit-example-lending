import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { stampOf, type Actor } from '@ddd-ts-kit/kernel';
import { rateGridPublishedV2 } from '@/contexts/credit-policy/published-language';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { KeepRateGridCommand } from '@/contexts/credit-application/offer/application/commands/keep-rate-grid/keep-rate-grid.command';
import { KeepRateGridHandler } from '@/contexts/credit-application/offer/application/commands/keep-rate-grid/keep-rate-grid.handler';
import { rateGridRowOf } from '@/contexts/credit-application/offer/application/projections/rate-grid-row-of.projection';
import { FakeRateGrids } from '@/contexts/credit-application/test/fakes/rate-grids.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['rate-grid.keep']] },
  }),
  map: AuthorizationMap.of(requires(KeepRateGridCommand, creditApplicationPermissions['rate-grid.keep'])),
});

const holder = anActor().withRole('holder').build();

describe('Keep rate grid', () => {
  it('keeps the rate grid in the read model', async () => {
    const { commandBus, grids } = arrange();

    await commandBus.execute(
      keepCommand(holder, publishedGrid('rate-grid-1', 'personal-loan', '2026-01-01T00:00:00.000Z')),
    );

    expect(await grids.get('rate-grid-1')).toMatchObject({ rateGridId: 'rate-grid-1', productId: 'personal-loan' });
  });

  it('keeps the same grid when the same event is delivered twice', async () => {
    const { commandBus, grids } = arrange();
    const command = keepCommand(holder, publishedGrid('rate-grid-1', 'personal-loan', '2026-01-01T00:00:00.000Z'));

    await commandBus.execute(command);
    await commandBus.execute(command);

    expect(await grids.get('rate-grid-1')).toMatchObject({ productId: 'personal-loan' });
  });

  it('keeps the newest grid when an older one arrives late', async () => {
    const { commandBus, grids } = arrange();

    await commandBus.execute(
      keepCommand(holder, publishedGrid('rate-grid-1', 'personal-loan-v2', '2026-02-01T00:00:00.000Z')),
    );

    await commandBus.execute(
      keepCommand(holder, publishedGrid('rate-grid-1', 'personal-loan', '2026-01-01T00:00:00.000Z')),
    );

    expect(await grids.get('rate-grid-1')).toMatchObject({ productId: 'personal-loan-v2' });
  });

  it('is refused to an actor who does not hold the permission rate-grid.keep, and keeps nothing', async () => {
    const { commandBus, grids } = arrange();

    const command = keepCommand(
      anActor().build(),
      publishedGrid('rate-grid-1', 'personal-loan', '2026-01-01T00:00:00.000Z'),
    );

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(await grids.get('rate-grid-1')).toBeUndefined();
  });
});

function arrange() {
  const { commandBus } = createTestBuses();
  const grids = new FakeRateGrids();

  commandBus.use(holders).register(KeepRateGridCommand, new KeepRateGridHandler(grids));

  return { commandBus, grids };
}

function publishedGrid(rateGridId: string, productId: string, occurredAt: string) {
  return rateGridPublishedV2.create(
    { rateGridId, productId, effectiveFrom: '2026-01-01' },
    { id: `event-${rateGridId}-${occurredAt}`, occurredAt },
  );
}

function keepCommand(actor: Actor, event: ReturnType<typeof publishedGrid>): KeepRateGridCommand {
  return new KeepRateGridCommand(actor, rateGridRowOf(event.payload), stampOf(event));
}
