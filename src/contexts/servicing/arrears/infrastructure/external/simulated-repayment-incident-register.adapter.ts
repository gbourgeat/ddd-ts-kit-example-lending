import type { RepaymentIncidentRegister } from '@/contexts/servicing/arrears/application/ports/repayment-incident-register.port';

export class SimulatedRepaymentIncidentRegister implements RepaymentIncidentRegister {
  private readonly declared = new Set<string>();

  async declare(loanReference: string): Promise<void> {
    this.declared.add(loanReference);
  }

  async withdraw(loanReference: string): Promise<void> {
    this.declared.delete(loanReference);
  }

  isDeclared(loanReference: string): boolean {
    return this.declared.has(loanReference);
  }
}
