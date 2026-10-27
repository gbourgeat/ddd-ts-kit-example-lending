import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CustomerDueDiligenceCodes } from '@/contexts/customer-due-diligence/customer-due-diligence.codes';

export class BusinessAlreadyRegistered extends DomainRefusal {
  readonly code = CustomerDueDiligenceCodes.BusinessAlreadyRegistered;

  static forCustomer(customerId: string) {
    return BusinessAlreadyRegistered.refusal(
      'The customer already has a registered business: a second registration is refused, never an overwrite.',
      { customerId },
    );
  }
}
