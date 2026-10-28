import { describe, expect, it } from '@jest/globals';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { productDefinedV2 } from '@/contexts/credit-policy/published-language';
import { KeepProductTermsIntegrationHandler } from '@/contexts/credit-application/file/application/integration/handlers/keep-product-terms.integration-handler';
import { KeepProductTermsCommand } from '@/contexts/credit-application/file/application/commands/keep-product-terms/keep-product-terms.command';
import { KeepProductTermsHandler } from '@/contexts/credit-application/file/application/commands/keep-product-terms/keep-product-terms.handler';
import { FakeProductTerms } from '@/contexts/credit-application/test/fakes/product-terms.fake';

describe('When credit-policy publishes credit-policy.product.defined', () => {
  it('listens to the type credit-policy publishes', () => {
    const { commandBus } = createTestBuses();
    const handler = new KeepProductTermsIntegrationHandler(commandBus);

    expect(handler).toBeInstanceOf(KeepProductTermsIntegrationHandler);
    expect(KeepProductTermsIntegrationHandler.eventType).toBe('credit-policy.product.defined');
  });

  it('acts as a system actor named after its consumer name', () => {
    const { commandBus } = createTestBuses();
    const handler = new KeepProductTermsIntegrationHandler(commandBus);

    expect(handler.actor).toMatchObject({ id: 'system:credit-application.keep-product-terms', type: 'system' });
  });

  it('keeps the terms of the product as credit-policy defined them, and has the same outcome when delivered twice', async () => {
    const { commandBus } = createTestBuses();
    const terms = new FakeProductTerms();

    commandBus.register(KeepProductTermsCommand, new KeepProductTermsHandler(terms));
    const handler = new KeepProductTermsIntegrationHandler(commandBus);

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
      { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' },
    );

    await handler.handle(event);
    await handler.handle(event);

    expect(await terms.get('product-1')).toMatchObject({ productId: 'product-1', insuranceMandatory: true });
  });
});
