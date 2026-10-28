import { AuthorizedQuery, type Actor } from '@ddd-ts-kit/kernel';
import type { ReadDeciderLevelResult } from '@/contexts/credit-application/decision/application/queries/read-decider-level/read-decider-level.result';

/** The level of one staff member, read by the decider who decides an application. */
export class ReadDeciderLevelQuery extends AuthorizedQuery<ReadDeciderLevelResult> {
  constructor(
    actor: Actor,
    readonly staffMemberId: string,
  ) {
    super(actor);
  }
}
