import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { stampOf } from '@ddd-ts-kit/kernel';
import { staffMemberAppointedV2 } from '@/contexts/branch-network/published-language';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { ReadDeciderLevelHandler } from '@/contexts/credit-application/decision/application/queries/read-decider-level/read-decider-level.handler';
import { ReadDeciderLevelQuery } from '@/contexts/credit-application/decision/application/queries/read-decider-level/read-decider-level.query';
import { deciderLevelRowOf } from '@/contexts/credit-application/decision/application/projections/decider-level-row-of.projection';
import { FakeDeciderLevels } from '@/contexts/credit-application/test/fakes/decider-levels.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.decide']] },
  }),
  map: AuthorizationMap.of(requires(ReadDeciderLevelQuery, creditApplicationPermissions['application.decide'])),
});

const holder = anActor().withRole('holder').build();

describe('Read decider level', () => {
  it('answers the branch and the level the staff member was appointed to', async () => {
    const levels = new FakeDeciderLevels();

    await keep(levels, 'staff-member-1', 'level-2');
    const queryBus = arrange(levels);

    const answer = await queryBus.execute(new ReadDeciderLevelQuery(holder, 'staff-member-1'));

    expect(answer).toEqual({ staffMemberId: 'staff-member-1', branchId: 'branch-1', level: 'level-2' });
  });

  it('answers the staff member asked for, not another one that is kept', async () => {
    const levels = new FakeDeciderLevels();

    await keep(levels, 'staff-member-1', 'level-2');
    await keep(levels, 'staff-member-2', 'level-4');
    const queryBus = arrange(levels);

    const answer = await queryBus.execute(new ReadDeciderLevelQuery(holder, 'staff-member-2'));

    expect(answer.level).toBe('level-4');
  });

  it('refuses to answer a staff member who was never appointed, with UNKNOWN_DECIDER_LEVEL', async () => {
    const queryBus = arrange(new FakeDeciderLevels());

    await expect(queryBus.execute(new ReadDeciderLevelQuery(holder, 'staff-member-9'))).rejects.toMatchObject({
      code: 'UNKNOWN_DECIDER_LEVEL',
    });
  });

  it('is refused to an actor who does not hold the permission application.decide', async () => {
    const queryBus = arrange(new FakeDeciderLevels());
    const query = new ReadDeciderLevelQuery(anActor().build(), 'staff-member-1');

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange(levels: FakeDeciderLevels) {
  const { queryBus } = createTestBuses();

  return queryBus.use(holders).register(ReadDeciderLevelQuery, new ReadDeciderLevelHandler(levels));
}

async function keep(levels: FakeDeciderLevels, staffMemberId: string, level: string): Promise<void> {
  const event = staffMemberAppointedV2.create(
    { staffMemberId, branchId: 'branch-1', level, accountId: staffMemberId },
    { id: `event-${staffMemberId}`, occurredAt: '2026-01-01T00:00:00.000Z' },
  );

  await levels.upsertIfNewer(staffMemberId, stampOf(event), () => deciderLevelRowOf(event.payload));
}
