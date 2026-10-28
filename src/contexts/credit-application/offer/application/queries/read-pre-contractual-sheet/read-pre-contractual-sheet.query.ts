import { AuthorizedQuery, type Actor } from '@ddd-ts-kit/kernel';
import type { ReadPreContractualSheetResult } from '@/contexts/credit-application/offer/application/queries/read-pre-contractual-sheet/read-pre-contractual-sheet.result';

/** The pre-contractual sheet of one offer: what the borrower is given before the offer is issued. */
export class ReadPreContractualSheetQuery extends AuthorizedQuery<ReadPreContractualSheetResult> {
  constructor(
    actor: Actor,
    readonly offerId: string,
  ) {
    super(actor);
  }
}
