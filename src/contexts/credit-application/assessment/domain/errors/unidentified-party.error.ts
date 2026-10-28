import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';

/** A party of the application is not identified by customer-due-diligence: the register cannot be asked about it. */
export class UnidentifiedParty extends DomainRefusal {
  readonly code = CreditApplicationCodes.UnidentifiedParty;

  static forCustomer(customerId: string) {
    return UnidentifiedParty.refusal('Unidentified party: the register cannot be consulted about it.', { customerId });
  }
}
