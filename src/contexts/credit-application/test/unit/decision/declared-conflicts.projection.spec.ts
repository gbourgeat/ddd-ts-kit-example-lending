import { describe, expect, it } from '@jest/globals';
import { conflictOfInterestDeclaredV1 } from '@/contexts/branch-network/published-language';
import { DeclaredConflictsProjection } from '@/contexts/credit-application/decision/application/projections/declared-conflicts.projection';
import { FakeDeclaredConflictsStore } from '@/contexts/credit-application/test/fakes/declared-conflicts-store.fake';

describe('Declared conflicts, kept from what branch-network announces', () => {
  it('keeps the staff member, the customer and the conflict branch-network declared', async () => {
    const store = new FakeDeclaredConflictsStore();
    const projection = new DeclaredConflictsProjection(store);

    await projection.declared(declaredAt('2026-01-01T00:00:00.000Z'));

    expect(await store.find('conflict-of-interest-1')).toEqual({
      conflictOfInterestId: 'conflict-of-interest-1',
      staffMemberId: 'staff-member-1',
      customerId: 'customer-1',
    });
  });

  it('keeps the same line when the same event is delivered twice', async () => {
    const store = new FakeDeclaredConflictsStore();
    const projection = new DeclaredConflictsProjection(store);
    const event = declaredAt('2026-01-01T00:00:00.000Z');

    await projection.declared(event);
    await projection.declared(event);

    expect(await store.find('conflict-of-interest-1')).toMatchObject({ staffMemberId: 'staff-member-1' });
  });

  it('keeps the line of an older event when a newer one already reached the line', async () => {
    const store = new FakeDeclaredConflictsStore();
    const projection = new DeclaredConflictsProjection(store);

    await projection.declared(
      conflictOfInterestDeclaredV1.create(
        {
          conflictOfInterestId: 'conflict-of-interest-1',
          staffMemberId: 'staff-member-2',
          customerId: 'customer-1',
          accountId: 'staff-member-2',
        },
        { id: 'event-late', occurredAt: '2026-02-01T00:00:00.000Z' },
      ),
    );

    await projection.declared(declaredAt('2026-01-01T00:00:00.000Z'));

    expect(await store.find('conflict-of-interest-1')).toMatchObject({ staffMemberId: 'staff-member-2' });
  });
});

function declaredAt(occurredAt: string, conflictOfInterestId = 'conflict-of-interest-1') {
  return conflictOfInterestDeclaredV1.create(
    { conflictOfInterestId, staffMemberId: 'staff-member-1', customerId: 'customer-1', accountId: 'staff-member-1' },
    { id: `event-${occurredAt}`, occurredAt },
  );
}
