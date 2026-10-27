import type { IntermediariesRegister } from '@/contexts/brokerage/application/ports/intermediaries-register.port';

export class SimulatedIntermediariesRegister implements IntermediariesRegister {
  private readonly registrations = new Map<string, { validFrom: Date; validUntil: Date | undefined }>();

  record(registrationNumber: string, validFrom: Date, validUntil?: Date): void {
    this.registrations.set(registrationNumber, { validFrom, validUntil });
  }

  async isValidOn(registrationNumber: string, day: Date): Promise<boolean> {
    const registration = this.registrations.get(registrationNumber);

    if (!registration) {
      return false;
    }

    return registration.validFrom <= day && (registration.validUntil === undefined || day <= registration.validUntil);
  }
}
