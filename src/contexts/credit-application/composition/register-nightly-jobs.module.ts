import { ErasePersonalDataPastRetentionJob } from '@/contexts/credit-application/file/application/scheduling/erase-personal-data-past-retention.job';
import type { Platform } from '@/platform/composition/platform';

/** The nightly jobs of the context, run per bank: the personal data of refused applications erased past retention. */
export function registerNightlyJobs(platform: Platform): void {
  const erasePersonalDataPastRetentionJob = new ErasePersonalDataPastRetentionJob(platform.commands);

  platform.jobs.register({
    name: 'credit-application.erase-personal-data-past-retention',
    schedule: { cron: '30 3 * * *', timeZone: 'Europe/Paris' },
    tenancy: 'per-tenant',
    run: (execution) => erasePersonalDataPastRetentionJob.run(execution),
  });
}
