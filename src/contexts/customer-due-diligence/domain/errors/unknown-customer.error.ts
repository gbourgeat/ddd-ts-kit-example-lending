import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CustomerDueDiligenceCodes } from '@/contexts/customer-due-diligence/customer-due-diligence.codes';

export class UnknownCustomer extends DomainRefusal {
  readonly code = CustomerDueDiligenceCodes.UnknownCustomer;

  static forCustomer(customerId: string) {
    return UnknownCustomer.refusal('No customer is known under this identifier.', { customerId });
  }
}
