import type { PersonalDataPurgeReport } from '@ddd-ts-kit/kernel';
import type { PersonalDataPurge } from '@/contexts/data-protection/application/ports/personal-data-purge.port';

/**
 * The purge of the platform, run in process: each copy a context declared purges the rows that
 * outlived their retention as of the instant given, and writes its audit entry. The adapter sums the
 * rows the copies reached.
 */
export class PlatformPersonalDataPurge implements PersonalDataPurge {
  constructor(private readonly runPurge: (asOf: Date) => Promise<PersonalDataPurgeReport>) {}

  async purgeExpired(asOf: Date): Promise<number> {
    const report = await this.runPurge(asOf);

    return Object.values(report.purged).reduce((total, rows) => total + rows, 0);
  }
}
