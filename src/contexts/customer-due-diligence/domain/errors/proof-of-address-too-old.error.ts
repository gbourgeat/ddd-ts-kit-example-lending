import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CustomerDueDiligenceCodes } from '@/contexts/customer-due-diligence/customer-due-diligence.codes';

export class ProofOfAddressTooOld extends DomainRefusal {
  readonly code = CustomerDueDiligenceCodes.ProofOfAddressTooOld;

  static forCustomer(customerId: string) {
    return ProofOfAddressTooOld.refusal('The proof of address is dated more than three months ago.', { customerId });
  }
}
