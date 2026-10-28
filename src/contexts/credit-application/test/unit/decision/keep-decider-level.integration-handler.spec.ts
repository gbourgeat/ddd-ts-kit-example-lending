import { InMemoryRelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import { describe, expect, it } from '@jest/globals';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { InMemoryCommandBus } from '@ddd-ts-kit/kernel';
import { staffMemberAppointedV2 } from '@/contexts/branch-network/published-language';
import { KeepDeciderLevelIntegrationHandler } from '@/contexts/credit-application/decision/application/integration/handlers/keep-decider-level.integration-handler';
import { KeepDeciderLevelCommand } from '@/contexts/credit-application/decision/application/commands/keep-decider-level/keep-decider-level.command';
import { KeepDeciderLevelHandler } from '@/contexts/credit-application/decision/application/commands/keep-decider-level/keep-decider-level.handler';
import { FakeDeciderLevels } from '@/contexts/credit-application/test/fakes/decider-levels.fake';

describe('When branch-network publishes branch-network.staff-member.appointed', () => {
  it('listens to the type branch-network publishes', () => {
    const handler = new KeepDeciderLevelIntegrationHandler(new InMemoryCommandBus());

    expect(handler).toBeInstanceOf(KeepDeciderLevelIntegrationHandler);
    expect(KeepDeciderLevelIntegrationHandler.eventType).toBe('branch-network.staff-member.appointed');
  });

  it('acts as a system actor named after its consumer name', () => {
    const handler = new KeepDeciderLevelIntegrationHandler(new InMemoryCommandBus());

    expect(handler.actor).toMatchObject({ id: 'system:credit-application.keep-decider-level', type: 'system' });
  });

  it('keeps the level the staff member was appointed to', async () => {
    const { handler, levels } = arrange();

    await handler.handle(appointed('level-2'));

    expect(await levels.get('staff-member-1')).toMatchObject({ staffMemberId: 'staff-member-1', level: 'level-2' });
  });

  it('has the same outcome when the same event is delivered twice', async () => {
    const { handler, levels } = arrange();
    const event = appointed('level-2');

    await handler.handle(event);
    await handler.handle(event);

    expect(await levels.get('staff-member-1')).toMatchObject({ level: 'level-2' });
  });
});

function arrange() {
  const { commandBus } = createTestBuses();
  const levels = new FakeDeciderLevels();

  commandBus.register(KeepDeciderLevelCommand, new KeepDeciderLevelHandler(levels, new InMemoryRelationTupleStore()));

  return { handler: new KeepDeciderLevelIntegrationHandler(commandBus), levels };
}

function appointed(level: string) {
  return staffMemberAppointedV2.create(
    { staffMemberId: 'staff-member-1', branchId: 'branch-1', level, accountId: 'staff-member-1' },
    { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' },
  );
}
