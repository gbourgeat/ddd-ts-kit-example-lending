import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { ConflictOfInterestDeclaredPublisher } from '@/contexts/branch-network/application/integration/publishers/conflict-of-interest-declared.publisher';
import { aStaffMember } from '@/contexts/branch-network/test/builders/staff-member.builder';
import { FakeStaffMemberRepository } from '@/contexts/branch-network/test/fakes/staff-member.repository.fake';
import { ConflictOfInterestDeclared } from '@/contexts/branch-network/domain/events/conflict-of-interest-declared.event';

describe('Publishing "conflict of interest declared" to other contexts', () => {
  it('publishes version 1 of branch-network.conflict-of-interest.declared', async () => {
    const bus = new InMemoryEventBus();
    const staffMembers = new FakeStaffMemberRepository();

    await staffMembers.save(aStaffMember().identifiedBy('staff-member-1').signedInAs('account-ada').build());
    const publisher = new ConflictOfInterestDeclaredPublisher(bus, new SequentialIdGenerator('event'), staffMembers);

    await publisher.handle(
      new ConflictOfInterestDeclared(
        'conflict-of-interest-1',
        'staff-member-1',
        'customer-1',
        new Date('2026-01-01T00:00:00.000Z'),
      ),
    );

    expect(bus.published).toEqual([
      {
        id: 'event-1',
        type: 'branch-network.conflict-of-interest.declared',
        version: 1,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: {
          conflictOfInterestId: 'conflict-of-interest-1',
          staffMemberId: 'staff-member-1',
          customerId: 'customer-1',
          accountId: 'account-ada',
        },
      },
    ]);
  });

  it('refuses to publish the conflict of a staff member who is not known', async () => {
    const publisher = new ConflictOfInterestDeclaredPublisher(
      new InMemoryEventBus(),
      new SequentialIdGenerator('event'),
      new FakeStaffMemberRepository(),
    );

    const event = new ConflictOfInterestDeclared(
      'conflict-1',
      'nobody',
      'customer-1',
      new Date('2026-01-01T00:00:00.000Z'),
    );

    await expect(publisher.handle(event)).rejects.toMatchObject({ code: 'UNKNOWN_STAFF_MEMBER' });
  });
});
