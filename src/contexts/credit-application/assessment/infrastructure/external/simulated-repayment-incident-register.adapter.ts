import type { RepaymentIncidentRegister } from '@/contexts/credit-application/assessment/application/ports/repayment-incident-register.port';

export class SimulatedRepaymentIncidentRegister implements RepaymentIncidentRegister {
  private readonly listed = new Set<string>();

  record(name: string, birthDate: Date): void {
    this.listed.add(this.keyOf(name, birthDate));
  }

  async isListed(name: string, birthDate: Date): Promise<boolean> {
    return this.listed.has(this.keyOf(name, birthDate));
  }

  private keyOf(name: string, birthDate: Date): string {
    return name.toLowerCase() + '|' + birthDate.toISOString();
  }
}
