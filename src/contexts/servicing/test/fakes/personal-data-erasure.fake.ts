import { PersonalDataErasure } from '@/contexts/servicing/ledger/application/ports/personal-data-erasure.port';

/** Records the loans whose personal values were erased, in the order of the erasures. */
export class FakePersonalDataErasure extends PersonalDataErasure {
  readonly erasedLoans: string[] = [];

  async erase(loanId: string): Promise<void> {
    this.erasedLoans.push(loanId);
  }
}
