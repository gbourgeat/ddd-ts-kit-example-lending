import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CustomerDueDiligenceCodes } from '@/contexts/customer-due-diligence/customer-due-diligence.codes';

export class BusinessNotRegistered extends DomainRefusal {
  readonly code = CustomerDueDiligenceCodes.BusinessNotRegistered;

  static forCustomer(customerId: string) {
    return BusinessNotRegistered.refusal(
      'The business is not registered yet: its directors and beneficial owners are identified after its registration.',
      { customerId },
    );
  }
}
