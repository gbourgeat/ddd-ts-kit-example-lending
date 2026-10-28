import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { stampOf, type Actor } from '@ddd-ts-kit/kernel';
import { staffMemberAppointedV2 } from '@/contexts/branch-network/published-language';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { KeepDeciderLevelCommand } from '@/contexts/credit-application/decision/application/commands/keep-decider-level/keep-decider-level.command';
import { KeepDeciderLevelHandler } from '@/contexts/credit-application/decision/application/commands/keep-decider-level/keep-decider-level.handler';
import { deciderLevelRowOf } from '@/contexts/credit-application/decision/application/projections/decider-level-row-of.projection';
import { FakeDeciderLevels } from '@/contexts/credit-application/test/fakes/decider-levels.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['decider-level.keep']] },
  }),
  map: AuthorizationMap.of(requires(KeepDeciderLevelCommand, creditApplicationPermissions['decider-level.keep'])),
});

const holder = anActor().withRole('holder').build();

describe('Keep decider level', () => {
  it('keeps the level the staff member was appointed to', async () => {
    const { commandBus, levels } = arrange();

    await commandBus.execute(keepCommand(holder, appointed('staff-member-1', 'level-2', '2026-01-01T00:00:00.000Z')));

    expect(await levels.get('staff-member-1')).toMatchObject({ staffMemberId: 'staff-member-1', level: 'level-2' });
  });

  it('keeps the same level when the same appointment is delivered twice', async () => {
    const { commandBus, levels } = arrange();
    const command = keepCommand(holder, appointed('staff-member-1', 'level-2', '2026-01-01T00:00:00.000Z'));

    await commandBus.execute(command);
    await commandBus.execute(command);

    expect(await levels.get('staff-member-1')).toMatchObject({ level: 'level-2' });
  });

  it('keeps the newest level when an older appointment arrives late', async () => {
    const { commandBus, levels } = arrange();

    await commandBus.execute(keepCommand(holder, appointed('staff-member-1', 'level-3', '2026-02-01T00:00:00.000Z')));
    await commandBus.execute(keepCommand(holder, appointed('staff-member-1', 'level-2', '2026-01-01T00:00:00.000Z')));

    expect(await levels.get('staff-member-1')).toMatchObject({ level: 'level-3' });
  });

  it('is refused to an actor who does not hold the permission decider-level.keep, and keeps nothing', async () => {
    const { commandBus, levels } = arrange();
    const command = keepCommand(anActor().build(), appointed('staff-member-1', 'level-2', '2026-01-01T00:00:00.000Z'));

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(await levels.get('staff-member-1')).toBeUndefined();
  });
});

function arrange() {
  const { commandBus } = createTestBuses();
  const levels = new FakeDeciderLevels();

  commandBus.use(holders).register(KeepDeciderLevelCommand, new KeepDeciderLevelHandler(levels));

  return { commandBus, levels };
}

function appointed(staffMemberId: string, level: string, occurredAt: string) {
  return staffMemberAppointedV2.create(
    { staffMemberId, branchId: 'branch-1', level },
    { id: `event-${staffMemberId}-${occurredAt}`, occurredAt },
  );
}

function keepCommand(actor: Actor, event: ReturnType<typeof appointed>): KeepDeciderLevelCommand {
  return new KeepDeciderLevelCommand(actor, deciderLevelRowOf(event.payload), stampOf(event));
}
