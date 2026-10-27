import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CustomerDueDiligenceCodes } from '@/contexts/customer-due-diligence/customer-due-diligence.codes';

export class IdentityDocumentExpired extends DomainRefusal {
  readonly code = CustomerDueDiligenceCodes.IdentityDocumentExpired;

  static forCustomer(customerId: string) {
    return IdentityDocumentExpired.refusal('The identity document is past its expiry date.', { customerId });
  }
}
