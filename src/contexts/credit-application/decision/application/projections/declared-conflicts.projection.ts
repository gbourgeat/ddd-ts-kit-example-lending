import { stampOf } from '@ddd-ts-kit/kernel';
import type { ConflictOfInterestDeclaredV1 } from '@/contexts/branch-network/published-language';
import type { DeclaredConflictsStore } from '@/contexts/credit-application/decision/application/ports/declared-conflicts-store.port';

/** Keeps the read model of declared conflicts from what branch-network announces. */
export class DeclaredConflictsProjection {
  constructor(private readonly store: DeclaredConflictsStore) {}

  async declared(event: ConflictOfInterestDeclaredV1): Promise<void> {
    await this.store.keep(
      {
        conflictOfInterestId: event.payload.conflictOfInterestId,
        staffMemberId: event.payload.staffMemberId,
        customerId: event.payload.customerId,
      },
      stampOf(event),
    );
  }
}
