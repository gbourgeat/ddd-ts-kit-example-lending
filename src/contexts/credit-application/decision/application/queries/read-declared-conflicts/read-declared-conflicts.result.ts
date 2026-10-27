import type { DeclaredConflictRow } from '@/contexts/credit-application/decision/application/projections/declared-conflict-row.projection';

/** The conflicts declared on the applicant of an application, in the order they were declared. */
export class ReadDeclaredConflictsResult {
  constructor(readonly conflicts: readonly DeclaredConflictRow[]) {}
}
