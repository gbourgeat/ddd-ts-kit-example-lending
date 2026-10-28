import { describe, expect, it } from '@jest/globals';
import { InMemoryCommandBus } from '@ddd-ts-kit/kernel';
import { delegationTablePublishedV2 } from '@/contexts/credit-policy/published-language';
import { KeepDelegationTableIntegrationHandler } from '@/contexts/credit-application/decision/application/integration/handlers/keep-delegation-table.integration-handler';

describe('When credit-policy publishes credit-policy.delegation-table.published', () => {
  it('listens to the type credit-policy publishes', () => {
    const handler = new KeepDelegationTableIntegrationHandler(new InMemoryCommandBus());

    expect(handler).toBeInstanceOf(KeepDelegationTableIntegrationHandler);
    expect(KeepDelegationTableIntegrationHandler.eventType).toBe('credit-policy.delegation-table.published');
  });

  it('acts as a system actor named after its consumer name', () => {
    const handler = new KeepDelegationTableIntegrationHandler(new InMemoryCommandBus());

    expect(handler.actor).toMatchObject({ id: 'system:credit-application.keep-delegation-table', type: 'system' });
  });

  it('receives the event as credit-policy publishes it', async () => {
    const handler = new KeepDelegationTableIntegrationHandler(new InMemoryCommandBus());
    const meta = { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' };

    // TODO(domain): give the payload every field credit-policy declares, register the command the handler executes and assert what credit-application did.
    const event = delegationTablePublishedV2.create(
      { delegationTableId: 'delegation-table-1', effectiveFrom: '2026-01-01T00:00:00.000Z', levels: [] },
      meta,
    );

    await expect(handler.handle(event)).resolves.toBeUndefined();
  });

  // TODO(domain): replace each entry below by a test that hands the handler an event built from the upstream declaration and asserts what credit-application did, through a real command bus with the handler and its fakes.
  it.todo('executes the command that follows the upstream fact');
  it.todo('has the same outcome when the same event is delivered twice');
});
