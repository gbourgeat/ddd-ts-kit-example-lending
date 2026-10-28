import { describe, expect, it } from '@jest/globals';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { InMemoryCommandBus } from '@ddd-ts-kit/kernel';
import { rateGridPublishedV2 } from '@/contexts/credit-policy/published-language';
import { KeepRateGridIntegrationHandler } from '@/contexts/credit-application/offer/application/integration/handlers/keep-rate-grid.integration-handler';
import { KeepRateGridCommand } from '@/contexts/credit-application/offer/application/commands/keep-rate-grid/keep-rate-grid.command';
import { KeepRateGridHandler } from '@/contexts/credit-application/offer/application/commands/keep-rate-grid/keep-rate-grid.handler';
import { FakeRateGrids } from '@/contexts/credit-application/test/fakes/rate-grids.fake';

describe('When credit-policy publishes credit-policy.rate-grid.published', () => {
  it('listens to the type credit-policy publishes', () => {
    const handler = new KeepRateGridIntegrationHandler(new InMemoryCommandBus());

    expect(handler).toBeInstanceOf(KeepRateGridIntegrationHandler);
    expect(KeepRateGridIntegrationHandler.eventType).toBe('credit-policy.rate-grid.published');
  });

  it('acts as a system actor named after its consumer name', () => {
    const handler = new KeepRateGridIntegrationHandler(new InMemoryCommandBus());

    expect(handler.actor).toMatchObject({ id: 'system:credit-application.keep-rate-grid', type: 'system' });
  });

  it('keeps the rate grid with the product and day credit-policy published', async () => {
    const { handler, grids } = arrange();

    await handler.handle(publishedGrid());

    expect(await grids.get('rate-grid-1')).toMatchObject({ rateGridId: 'rate-grid-1', productId: 'personal-loan' });
  });

  it('has the same outcome when the same event is delivered twice', async () => {
    const { handler, grids } = arrange();
    const event = publishedGrid();

    await handler.handle(event);
    await handler.handle(event);

    expect(await grids.get('rate-grid-1')).toMatchObject({ productId: 'personal-loan' });
  });
});

function arrange() {
  const { commandBus } = createTestBuses();
  const grids = new FakeRateGrids();

  commandBus.register(KeepRateGridCommand, new KeepRateGridHandler(grids));

  return { handler: new KeepRateGridIntegrationHandler(commandBus), grids };
}

function publishedGrid() {
  return rateGridPublishedV2.create(
    { rateGridId: 'rate-grid-1', productId: 'personal-loan', effectiveFrom: '2026-01-01', rates: [] },
    { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' },
  );
}
