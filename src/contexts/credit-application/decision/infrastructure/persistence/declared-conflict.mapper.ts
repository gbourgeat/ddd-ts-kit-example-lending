import type { DeclaredConflictRow } from '@/contexts/credit-application/decision/application/read-model/declared-conflict-row';

/** The line of the declared conflicts table as the read model holds it. */
export class DeclaredConflictMapper {
  toRow(record: { id: string; staffMemberId: string; customerId: string }): DeclaredConflictRow {
    return {
      conflictOfInterestId: record.id,
      staffMemberId: record.staffMemberId,
      customerId: record.customerId,
    };
  }
}
