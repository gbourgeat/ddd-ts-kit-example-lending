import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { stampOf } from '@ddd-ts-kit/kernel';
import { delegationTablePublishedV2 } from '@/contexts/credit-policy/published-language';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { ReadDelegationTableHandler } from '@/contexts/credit-application/decision/application/queries/read-delegation-table/read-delegation-table.handler';
import { ReadDelegationTableQuery } from '@/contexts/credit-application/decision/application/queries/read-delegation-table/read-delegation-table.query';
import { delegationTableRowOf } from '@/contexts/credit-application/decision/application/projections/delegation-table-row-of.projection';
import { FakeDelegationTables } from '@/contexts/credit-application/test/fakes/delegation-tables.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.decide']] },
  }),
  map: AuthorizationMap.of(requires(ReadDelegationTableQuery, creditApplicationPermissions['application.decide'])),
});

const holder = anActor().withRole('holder').build();

describe('Read delegation table', () => {
  it('answers the levels and the day the table takes effect', async () => {
    const tables = new FakeDelegationTables();

    await keep(tables, 'delegation-table-1');
    const queryBus = arrange(tables);

    const answer = await queryBus.execute(new ReadDelegationTableQuery(holder, 'delegation-table-1'));

    expect(answer).toEqual({
      delegationTableId: 'delegation-table-1',
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      levels: [{ level: 'level-1', amountCents: 500000 }],
    });
  });

  it('answers the table asked for, not another one that is kept', async () => {
    const tables = new FakeDelegationTables();

    await keep(tables, 'delegation-table-1');
    await keep(tables, 'delegation-table-2');
    const queryBus = arrange(tables);

    const answer = await queryBus.execute(new ReadDelegationTableQuery(holder, 'delegation-table-2'));

    expect(answer.delegationTableId).toBe('delegation-table-2');
  });

  it('refuses to answer a delegation table that was never published with UNKNOWN_DELEGATION_TABLE', async () => {
    const queryBus = arrange(new FakeDelegationTables());

    await expect(queryBus.execute(new ReadDelegationTableQuery(holder, 'delegation-table-9'))).rejects.toMatchObject({
      code: 'UNKNOWN_DELEGATION_TABLE',
    });
  });

  it('is refused to an actor who does not hold the permission application.decide', async () => {
    const queryBus = arrange(new FakeDelegationTables());
    const query = new ReadDelegationTableQuery(anActor().build(), 'delegation-table-1');

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange(tables: FakeDelegationTables) {
  const { queryBus } = createTestBuses();

  return queryBus.use(holders).register(ReadDelegationTableQuery, new ReadDelegationTableHandler(tables));
}

async function keep(tables: FakeDelegationTables, delegationTableId: string): Promise<void> {
  const event = delegationTablePublishedV2.create(
    {
      delegationTableId,
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      levels: [{ level: 'level-1', amountCents: 500000 }],
    },
    { id: `event-${delegationTableId}`, occurredAt: '2026-01-01T00:00:00.000Z' },
  );

  await tables.upsertIfNewer(delegationTableId, stampOf(event), () => delegationTableRowOf(event.payload));
}
