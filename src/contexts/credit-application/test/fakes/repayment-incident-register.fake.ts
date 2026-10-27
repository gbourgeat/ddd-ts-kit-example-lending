import type { RepaymentIncidentRegister } from '@/contexts/credit-application/assessment/application/ports/repayment-incident-register.port';

export class FakeRepaymentIncidentRegister implements RepaymentIncidentRegister {
  readonly asked: { name: string; birthDate: Date }[] = [];

  private readonly listed = new Set<string>();

  markListed(name: string): void {
    this.listed.add(name);
  }

  async isListed(name: string, birthDate: Date): Promise<boolean> {
    this.asked.push({ name, birthDate });

    return this.listed.has(name);
  }
}
