import { DeclaredConflictRow } from '@/contexts/credit-application/decision/application/projections/declared-conflict-row.projection';

/** The line of the declared conflicts table as the read model holds it. */
export class DeclaredConflictMapper {
  toRow(record: { id: string; staffMemberId: string; customerId: string }): DeclaredConflictRow {
    return new DeclaredConflictRow(record.id, record.staffMemberId, record.customerId);
  }
}
