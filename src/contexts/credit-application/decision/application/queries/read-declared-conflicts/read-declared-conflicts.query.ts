import { AuthorizedQuery, type Actor } from '@ddd-ts-kit/kernel';
import type { ReadDeclaredConflictsResult } from '@/contexts/credit-application/decision/application/queries/read-declared-conflicts/read-declared-conflicts.result';

/** The declared conflicts of the applicant of one application, read by the decider before deciding it. */
export class ReadDeclaredConflictsQuery extends AuthorizedQuery<ReadDeclaredConflictsResult> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
  ) {
    super(actor);
  }
}
