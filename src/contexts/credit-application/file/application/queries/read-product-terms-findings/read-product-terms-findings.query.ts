import { AuthorizedQuery, type Actor } from '@ddd-ts-kit/kernel';
import type { ReadProductTermsFindingsResult } from '@/contexts/credit-application/file/application/queries/read-product-terms-findings/read-product-terms-findings.result';

/** The findings that the checks of one application against its product kept in its file: read by a decider before deciding it. */
export class ReadProductTermsFindingsQuery extends AuthorizedQuery<ReadProductTermsFindingsResult> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
  ) {
    super(actor);
  }
}
