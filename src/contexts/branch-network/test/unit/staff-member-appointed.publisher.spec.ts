import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { StaffMemberAppointedPublisher } from '@/contexts/branch-network/application/integration/publishers/staff-member-appointed.publisher';
import { StaffMemberAppointed } from '@/contexts/branch-network/domain/events/staff-member-appointed.event';

describe('Publishing "staff member appointed" to other contexts', () => {
  it('publishes version 1 and version 2 of branch-network.staff-member.appointed', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new StaffMemberAppointedPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(
      new StaffMemberAppointed('staff-member-1', new Date('2026-01-01T00:00:00.000Z'), {
        branchId: 'branch-1',
        level: 'risk-manager',
      }),
    );

    expect(bus.published).toEqual([
      {
        id: 'event-1',
        type: 'branch-network.staff-member.appointed',
        version: 1,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: { staffMemberId: 'staff-member-1' },
      },
      {
        id: 'event-2',
        type: 'branch-network.staff-member.appointed',
        version: 2,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: { staffMemberId: 'staff-member-1', branchId: 'branch-1', level: 'risk-manager' },
      },
    ]);
  });
});
