import type { RepaymentIncidentRegister } from '@/contexts/servicing/arrears/application/ports/repayment-incident-register.port';

export class FakeRepaymentIncidentRegister implements RepaymentIncidentRegister {
  private readonly declared = new Set<string>();

  isDeclared(loanReference: string): boolean {
    return this.declared.has(loanReference);
  }

  async declare(loanReference: string): Promise<void> {
    this.declared.add(loanReference);
  }

  async withdraw(loanReference: string): Promise<void> {
    this.declared.delete(loanReference);
  }
}
