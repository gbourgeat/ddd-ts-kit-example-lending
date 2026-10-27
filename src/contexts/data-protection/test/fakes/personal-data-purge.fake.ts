import type { PersonalDataPurge } from '@/contexts/data-protection/application/ports/personal-data-purge.port';

export class FakePersonalDataPurge implements PersonalDataPurge {
  purges = 0;

  constructor(private readonly rowsPurged = 0) {}

  async purgeExpired(): Promise<number> {
    this.purges += 1;

    return this.rowsPurged;
  }
}
