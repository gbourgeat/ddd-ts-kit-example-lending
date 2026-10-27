import type { PersonalDataPurgeReport } from '@ddd-ts-kit/kernel';
import type { PersonalDataPurge } from '@/contexts/data-protection/application/ports/personal-data-purge.port';

/**
 * The purge of the platform, run in process: each copy a context declared purges the rows that
 * outlived its retention, and writes its audit entry. The adapter sums the rows the copies reached.
 */
export class PlatformPersonalDataPurge implements PersonalDataPurge {
  constructor(private readonly runPurge: () => Promise<PersonalDataPurgeReport>) {}

  async purgeExpired(): Promise<number> {
    const report = await this.runPurge();

    return Object.values(report.purged).reduce((total, rows) => total + rows, 0);
  }
}
