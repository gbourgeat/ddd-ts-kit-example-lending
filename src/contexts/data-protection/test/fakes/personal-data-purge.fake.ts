import type { PersonalDataPurge } from '@/contexts/data-protection/application/ports/personal-data-purge.port';

export class FakePersonalDataPurge implements PersonalDataPurge {
  readonly asOfs: Date[] = [];

  constructor(private readonly rowsPurged = 0) {}

  async purgeExpired(asOf: Date): Promise<number> {
    this.asOfs.push(asOf);

    return this.rowsPurged;
  }
}
