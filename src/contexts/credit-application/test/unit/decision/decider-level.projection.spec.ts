import { describe, expect, it } from '@jest/globals';
import { staffMemberAppointedV2 } from '@/contexts/branch-network/published-language';
import { DeciderLevelProjection } from '@/contexts/credit-application/decision/application/projections/decider-level.projection';

describe('Decider level, kept from what branch-network announces', () => {
  it('receives branch-network.staff-member.appointed as branch-network publishes it', async () => {
    const projection = new DeciderLevelProjection();

    // TODO(domain): give the payload every field branch-network declares, hand the projection the fake of its read model and assert the line it keeps.
    const event = staffMemberAppointedV2.create(
      { staffMemberId: 'staff-member-1', branchId: 'branch-1', level: 'level-1' },
      { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' },
    );

    await expect(projection.appointed(event)).resolves.toBeUndefined();
  });

  // TODO(domain): replace each entry below by a test that publishes events through the test application, with the fake of the read model bound to its port, and asserts the line that is kept.
  it.todo('keeps the same line when the same event is delivered twice');
  it.todo('keeps the newest line when an older event is delivered late');
});
