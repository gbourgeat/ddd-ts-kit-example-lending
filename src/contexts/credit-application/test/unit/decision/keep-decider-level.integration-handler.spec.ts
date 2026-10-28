import { describe, expect, it } from '@jest/globals';
import { InMemoryCommandBus } from '@ddd-ts-kit/kernel';
import { staffMemberAppointedV2 } from '@/contexts/branch-network/published-language';
import { KeepDeciderLevelIntegrationHandler } from '@/contexts/credit-application/decision/application/integration/handlers/keep-decider-level.integration-handler';

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

  it('receives the event as branch-network publishes it', async () => {
    const handler = new KeepDeciderLevelIntegrationHandler(new InMemoryCommandBus());
    const meta = { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' };

    // TODO(domain): give the payload every field branch-network declares, register the command the handler executes and assert what credit-application did.
    const event = staffMemberAppointedV2.create(
      { staffMemberId: 'staff-member-1', branchId: 'branch-1', level: 'level-1' },
      meta,
    );

    await expect(handler.handle(event)).resolves.toBeUndefined();
  });

  // TODO(domain): replace each entry below by a test that hands the handler an event built from the upstream declaration and asserts what credit-application did, through a real command bus with the handler and its fakes.
  it.todo('executes the command that follows the upstream fact');
  it.todo('has the same outcome when the same event is delivered twice');
});
