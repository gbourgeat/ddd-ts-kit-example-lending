import { describe, expect, it } from '@jest/globals';
import { InMemoryCommandBus } from '@ddd-ts-kit/kernel';
import { productDefinedV2 } from '@/contexts/credit-policy/published-language';
import { KeepProductTermsIntegrationHandler } from '@/contexts/credit-application/file/application/integration/handlers/keep-product-terms.integration-handler';

describe('When credit-policy publishes credit-policy.product.defined', () => {
  it('listens to the type credit-policy publishes', () => {
    const handler = new KeepProductTermsIntegrationHandler(new InMemoryCommandBus());

    expect(handler).toBeInstanceOf(KeepProductTermsIntegrationHandler);
    expect(KeepProductTermsIntegrationHandler.eventType).toBe('credit-policy.product.defined');
  });

  it('acts as a system actor named after its consumer name', () => {
    const handler = new KeepProductTermsIntegrationHandler(new InMemoryCommandBus());

    expect(handler.actor).toMatchObject({ id: 'system:credit-application.keep-product-terms', type: 'system' });
  });

  it('receives the event as credit-policy publishes it', async () => {
    const handler = new KeepProductTermsIntegrationHandler(new InMemoryCommandBus());
    const meta = { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' };

    // TODO(domain): give the payload every field credit-policy declares, register the command the handler executes and assert what credit-application did.
    const event = productDefinedV2.create(
      {
        productId: 'product-1',
        amountMinimumCents: 100_000,
        amountMaximumCents: 2_500_000,
        durationMinimumMonths: 12,
        durationMaximumMonths: 84,
        arrangementFeeCents: 4_500,
        insuranceMandatory: true,
      },
      meta,
    );

    await expect(handler.handle(event)).resolves.toBeUndefined();
  });

  // TODO(domain): replace each entry below by a test that hands the handler an event built from the upstream declaration and asserts what credit-application did, through a real command bus with the handler and its fakes.
  it.todo('executes the command that follows the upstream fact');
  it.todo('has the same outcome when the same event is delivered twice');
});
