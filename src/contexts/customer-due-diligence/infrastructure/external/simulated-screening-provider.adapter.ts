import type { ScreeningProvider } from '@/contexts/customer-due-diligence/application/ports/screening-provider.port';

export class SimulatedScreeningProvider implements ScreeningProvider {
  private readonly listed: { readonly name: string; readonly birthDate: Date }[] = [];

  record(name: string, birthDate: Date): void {
    this.listed.push({ name, birthDate });
  }

  async screen(name: string, birthDate: Date): Promise<{ readonly possibleMatch: boolean }> {
    const possibleMatch = this.listed.some(
      (entry) => entry.name.toLowerCase() === name.toLowerCase() && entry.birthDate.getTime() === birthDate.getTime(),
    );

    return { possibleMatch };
  }
}
