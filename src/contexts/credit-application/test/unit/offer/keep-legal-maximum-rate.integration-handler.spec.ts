import { describe, expect, it } from '@jest/globals';
import { InMemoryCommandBus } from '@ddd-ts-kit/kernel';
import { legalMaximumRatePublishedV2 } from '@/contexts/credit-policy/published-language';
import { KeepLegalMaximumRateIntegrationHandler } from '@/contexts/credit-application/offer/application/integration/handlers/keep-legal-maximum-rate.integration-handler';

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

  it('receives the event as credit-policy publishes it', async () => {
    const handler = new KeepLegalMaximumRateIntegrationHandler(new InMemoryCommandBus());
    const meta = { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' };

    // TODO(domain): give the payload every field credit-policy declares, register the command the handler executes and assert what credit-application did.
    const event = legalMaximumRatePublishedV2.create(
      {
        legalMaximumRateId: 'legal-maximum-rate-1',
        category: 'consumer',
        rateBasisPoints: 700,
        effectiveFrom: '2026-01-01',
      },
      meta,
    );

    await expect(handler.handle(event)).resolves.toBeUndefined();
  });

  // TODO(domain): replace each entry below by a test that hands the handler an event built from the upstream declaration and asserts what credit-application did, through a real command bus with the handler and its fakes.
  it.todo('executes the command that follows the upstream fact');
  it.todo('has the same outcome when the same event is delivered twice');
});
