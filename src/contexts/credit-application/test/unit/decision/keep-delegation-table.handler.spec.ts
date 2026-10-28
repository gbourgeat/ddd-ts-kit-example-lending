import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { stampOf, type Actor } from '@ddd-ts-kit/kernel';
import { delegationTablePublishedV2 } from '@/contexts/credit-policy/published-language';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { KeepDelegationTableCommand } from '@/contexts/credit-application/decision/application/commands/keep-delegation-table/keep-delegation-table.command';
import { KeepDelegationTableHandler } from '@/contexts/credit-application/decision/application/commands/keep-delegation-table/keep-delegation-table.handler';
import { delegationTableRowOf } from '@/contexts/credit-application/decision/application/projections/delegation-table-row-of.projection';
import { FakeDelegationTables } from '@/contexts/credit-application/test/fakes/delegation-tables.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['delegation-table.keep']] },
  }),
  map: AuthorizationMap.of(requires(KeepDelegationTableCommand, creditApplicationPermissions['delegation-table.keep'])),
});

const holder = anActor().withRole('holder').build();

describe('Keep delegation table', () => {
  it('keeps the delegation table in the read model', async () => {
    const { commandBus, tables } = arrange();

    await commandBus.execute(
      keepCommand(holder, publishedTable('delegation-table-1', 500000, '2026-01-01T00:00:00.000Z')),
    );

    expect(await tables.get('delegation-table-1')).toMatchObject({
      delegationTableId: 'delegation-table-1',
      levels: [{ level: 'level-1', amountCents: 500000 }],
    });
  });

  it('keeps the same table when the same event is delivered twice', async () => {
    const { commandBus, tables } = arrange();
    const command = keepCommand(holder, publishedTable('delegation-table-1', 500000, '2026-01-01T00:00:00.000Z'));

    await commandBus.execute(command);
    await commandBus.execute(command);

    expect(await tables.get('delegation-table-1')).toMatchObject({ levels: [{ amountCents: 500000 }] });
  });

  it('keeps the newest table when an older one arrives late', async () => {
    const { commandBus, tables } = arrange();

    await commandBus.execute(
      keepCommand(holder, publishedTable('delegation-table-1', 700000, '2026-02-01T00:00:00.000Z')),
    );

    await commandBus.execute(
      keepCommand(holder, publishedTable('delegation-table-1', 500000, '2026-01-01T00:00:00.000Z')),
    );

    expect(await tables.get('delegation-table-1')).toMatchObject({ levels: [{ amountCents: 700000 }] });
  });

  it('is refused to an actor who does not hold the permission delegation-table.keep, and keeps nothing', async () => {
    const { commandBus, tables } = arrange();

    const command = keepCommand(
      anActor().build(),
      publishedTable('delegation-table-1', 500000, '2026-01-01T00:00:00.000Z'),
    );

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(await tables.get('delegation-table-1')).toBeUndefined();
  });
});

function arrange() {
  const { commandBus } = createTestBuses();
  const tables = new FakeDelegationTables();

  commandBus.use(holders).register(KeepDelegationTableCommand, new KeepDelegationTableHandler(tables));

  return { commandBus, tables };
}

function publishedTable(delegationTableId: string, amountCents: number, occurredAt: string) {
  return delegationTablePublishedV2.create(
    { delegationTableId, effectiveFrom: '2026-01-01T00:00:00.000Z', levels: [{ level: 'level-1', amountCents }] },
    { id: `event-${delegationTableId}-${occurredAt}`, occurredAt },
  );
}

function keepCommand(actor: Actor, event: ReturnType<typeof publishedTable>): KeepDelegationTableCommand {
  return new KeepDelegationTableCommand(actor, delegationTableRowOf(event.payload), stampOf(event));
}
