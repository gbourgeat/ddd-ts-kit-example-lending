import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CustomerDueDiligenceCodes } from '@/contexts/customer-due-diligence/customer-due-diligence.codes';

export class NoPossibleMatch extends DomainRefusal {
  readonly code = CustomerDueDiligenceCodes.NoPossibleMatch;

  static forCustomer(customerId: string) {
    return NoPossibleMatch.refusal(
      'No possible match is waiting for compliance review on this customer: only a possible match can be confirmed.',
      { customerId },
    );
  }
}
