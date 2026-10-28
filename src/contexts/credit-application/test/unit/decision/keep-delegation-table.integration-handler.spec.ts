import { describe, expect, it } from '@jest/globals';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { InMemoryCommandBus } from '@ddd-ts-kit/kernel';
import { delegationTablePublishedV2 } from '@/contexts/credit-policy/published-language';
import { KeepDelegationTableIntegrationHandler } from '@/contexts/credit-application/decision/application/integration/handlers/keep-delegation-table.integration-handler';
import { KeepDelegationTableCommand } from '@/contexts/credit-application/decision/application/commands/keep-delegation-table/keep-delegation-table.command';
import { KeepDelegationTableHandler } from '@/contexts/credit-application/decision/application/commands/keep-delegation-table/keep-delegation-table.handler';
import { FakeDelegationTables } from '@/contexts/credit-application/test/fakes/delegation-tables.fake';

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

  it('keeps the delegation table with the levels credit-policy published', async () => {
    const { handler, tables } = arrange();

    await handler.handle(publishedTable(500000));

    expect(await tables.get('delegation-table-1')).toMatchObject({
      levels: [{ level: 'level-1', amountCents: 500000 }],
    });
  });

  it('has the same outcome when the same event is delivered twice', async () => {
    const { handler, tables } = arrange();
    const event = publishedTable(500000);

    await handler.handle(event);
    await handler.handle(event);

    expect(await tables.get('delegation-table-1')).toMatchObject({ levels: [{ amountCents: 500000 }] });
  });
});

function arrange() {
  const { commandBus } = createTestBuses();
  const tables = new FakeDelegationTables();

  commandBus.register(KeepDelegationTableCommand, new KeepDelegationTableHandler(tables));

  return { handler: new KeepDelegationTableIntegrationHandler(commandBus), tables };
}

function publishedTable(amountCents: number) {
  return delegationTablePublishedV2.create(
    {
      delegationTableId: 'delegation-table-1',
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      levels: [{ level: 'level-1', amountCents }],
    },
    { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' },
  );
}
