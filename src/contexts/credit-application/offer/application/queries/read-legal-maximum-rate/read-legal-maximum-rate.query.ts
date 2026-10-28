import { AuthorizedQuery, type Actor } from '@ddd-ts-kit/kernel';
import type { ReadLegalMaximumRateResult } from '@/contexts/credit-application/offer/application/queries/read-legal-maximum-rate/read-legal-maximum-rate.result';

/** The legal maximum rate of one id, read by a decider before deciding an application. */
export class ReadLegalMaximumRateQuery extends AuthorizedQuery<ReadLegalMaximumRateResult> {
  constructor(
    actor: Actor,
    readonly legalMaximumRateId: string,
  ) {
    super(actor);
  }
}
