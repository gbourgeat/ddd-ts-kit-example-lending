import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ServicingCodes } from '@/contexts/servicing/servicing.codes';

export class BorrowerNotIdentified extends DomainRefusal {
  readonly code = ServicingCodes.BorrowerNotIdentified;

  /** The payout is recorded only once the name of its borrower is known: the event is retried until it is. */
  static forCustomer(customerId: string) {
    return BorrowerNotIdentified.refusal('The borrower of the payout is not identified yet.', { customerId });
  }
}
