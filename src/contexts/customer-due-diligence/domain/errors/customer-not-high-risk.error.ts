import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CustomerDueDiligenceCodes } from '@/contexts/customer-due-diligence/customer-due-diligence.codes';

export class CustomerNotHighRisk extends DomainRefusal {
  readonly code = CustomerDueDiligenceCodes.CustomerNotHighRisk;

  static forCustomer(customerId: string) {
    return CustomerNotHighRisk.refusal(
      'This customer is not rated high risk: only a high risk customer can be approved by compliance.',
      { customerId },
    );
  }
}
