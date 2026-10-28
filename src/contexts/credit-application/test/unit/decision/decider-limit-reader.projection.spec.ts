import { describe, expect, it } from '@jest/globals';
import { DeciderLimitReader } from '@/contexts/credit-application/decision/application/projections/decider-limit-reader.projection';
import { FakeDeciderLevels } from '@/contexts/credit-application/test/fakes/decider-levels.fake';
import { FakeDelegationTables } from '@/contexts/credit-application/test/fakes/delegation-tables.fake';

const day = new Date('2026-06-01T00:00:00.000Z');
const stamp = { eventId: 'event-1', occurredAt: day };

const levels = [
  { level: 'advisor', amountCents: 1_500_000 },
  { level: 'credit analyst', amountCents: 7_500_000 },
];

describe('Decider limit reader', () => {
  it('reads the level of the decider and the levels of the table in force on the day', async () => {
    const { reader, deciderLevels, delegationTables } = arrange();

    await deciderLevels.upsertIfNewer('grace', stamp, () => ({
      staffMemberId: 'grace',
      branchId: 'branch-1',
      level: 'advisor',
    }));

    await delegationTables.upsertIfNewer('table-1', stamp, () => ({
      delegationTableId: 'table-1',
      effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
      levels,
    }));

    expect(await reader.readFor('grace', day)).toEqual({ level: 'advisor', levels });
  });

  it('refuses a decider whose level is not known, with UNKNOWN_DECIDER_LEVEL', async () => {
    const { reader } = arrange();

    await expect(reader.readFor('nobody', day)).rejects.toMatchObject({ code: 'UNKNOWN_DECIDER_LEVEL' });
  });

  it('refuses when no table is in force on the day, with UNKNOWN_DELEGATION_TABLE', async () => {
    const { reader, deciderLevels } = arrange();

    await deciderLevels.upsertIfNewer('grace', stamp, () => ({
      staffMemberId: 'grace',
      branchId: 'branch-1',
      level: 'advisor',
    }));

    await expect(reader.readFor('grace', day)).rejects.toMatchObject({ code: 'UNKNOWN_DELEGATION_TABLE' });
  });
});

function arrange() {
  const deciderLevels = new FakeDeciderLevels();
  const delegationTables = new FakeDelegationTables();

  return { reader: new DeciderLimitReader(deciderLevels, delegationTables), deciderLevels, delegationTables };
}
