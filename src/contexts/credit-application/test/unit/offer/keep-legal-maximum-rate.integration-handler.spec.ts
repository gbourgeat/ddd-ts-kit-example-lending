import { describe, expect, it } from '@jest/globals';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { InMemoryCommandBus } from '@ddd-ts-kit/kernel';
import { legalMaximumRatePublishedV2 } from '@/contexts/credit-policy/published-language';
import { KeepLegalMaximumRateIntegrationHandler } from '@/contexts/credit-application/offer/application/integration/handlers/keep-legal-maximum-rate.integration-handler';
import { KeepLegalMaximumRateCommand } from '@/contexts/credit-application/offer/application/commands/keep-legal-maximum-rate/keep-legal-maximum-rate.command';
import { KeepLegalMaximumRateHandler } from '@/contexts/credit-application/offer/application/commands/keep-legal-maximum-rate/keep-legal-maximum-rate.handler';
import { FakeLegalMaximumRates } from '@/contexts/credit-application/test/fakes/legal-maximum-rates.fake';

describe('When credit-policy publishes credit-policy.legal-maximum-rate.published', () => {
  it('listens to the type credit-policy publishes', () => {
    const handler = new KeepLegalMaximumRateIntegrationHandler(new InMemoryCommandBus());

    expect(handler).toBeInstanceOf(KeepLegalMaximumRateIntegrationHandler);
    expect(KeepLegalMaximumRateIntegrationHandler.eventType).toBe('credit-policy.legal-maximum-rate.published');
  });

  it('acts as a system actor named after its consumer name', () => {
    const handler = new KeepLegalMaximumRateIntegrationHandler(new InMemoryCommandBus());

    expect(handler.actor).toMatchObject({ id: 'system:credit-application.keep-legal-maximum-rate', type: 'system' });
  });

  it('keeps the legal maximum rate with the category and the rate credit-policy published', async () => {
    const { handler, rates } = arrange();

    await handler.handle(publishedRate());

    expect(await rates.get('maximum-1')).toMatchObject({ category: 'car', rateBasisPoints: 1250 });
  });

  it('has the same outcome when the same event is delivered twice', async () => {
    const { handler, rates } = arrange();
    const event = publishedRate();

    await handler.handle(event);
    await handler.handle(event);

    expect(await rates.get('maximum-1')).toMatchObject({ rateBasisPoints: 1250 });
  });
});

function arrange() {
  const { commandBus } = createTestBuses();
  const rates = new FakeLegalMaximumRates();

  commandBus.register(KeepLegalMaximumRateCommand, new KeepLegalMaximumRateHandler(rates));

  return { handler: new KeepLegalMaximumRateIntegrationHandler(commandBus), rates };
}

function publishedRate() {
  return legalMaximumRatePublishedV2.create(
    { legalMaximumRateId: 'maximum-1', category: 'car', rateBasisPoints: 1250, effectiveFrom: '2026-01-01' },
    { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' },
  );
}
