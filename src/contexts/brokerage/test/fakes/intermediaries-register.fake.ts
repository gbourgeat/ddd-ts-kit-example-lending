import type { IntermediariesRegister } from '@/contexts/brokerage/application/ports/intermediaries-register.port';

export class FakeIntermediariesRegister implements IntermediariesRegister {
  readonly asked: { registrationNumber: string; day: Date }[] = [];

  private readonly valid = new Set<string>();

  markValid(registrationNumber: string): void {
    this.valid.add(registrationNumber);
  }

  revoke(registrationNumber: string): void {
    this.valid.delete(registrationNumber);
  }

  async isValidOn(registrationNumber: string, day: Date): Promise<boolean> {
    this.asked.push({ registrationNumber, day });

    return this.valid.has(registrationNumber);
  }
}
