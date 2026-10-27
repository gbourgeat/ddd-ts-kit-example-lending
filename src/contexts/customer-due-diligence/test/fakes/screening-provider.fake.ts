import type { ScreeningProvider } from '@/contexts/customer-due-diligence/application/ports/screening-provider.port';

export class FakeScreeningProvider implements ScreeningProvider {
  readonly screened: { name: string; birthDate: Date }[] = [];

  private readonly listed = new Set<string>();

  markPossibleMatch(name: string): void {
    this.listed.add(name);
  }

  async screen(name: string, birthDate: Date): Promise<{ readonly possibleMatch: boolean }> {
    this.screened.push({ name, birthDate });

    return { possibleMatch: this.listed.has(name) };
  }
}
