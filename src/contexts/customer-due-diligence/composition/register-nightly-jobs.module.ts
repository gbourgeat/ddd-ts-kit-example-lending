import { FlagOverdueDueDiligenceJob } from '@/contexts/customer-due-diligence/application/scheduling/flag-overdue-due-diligence.job';
import { ErasePersonalDataPastRetentionJob } from '@/contexts/customer-due-diligence/application/scheduling/erase-personal-data-past-retention.job';
import type { Platform } from '@/platform/composition/platform';

/** The nightly jobs of the context, run per bank: the overdue due diligence flagged, the personal data past retention erased. */
export function registerNightlyJobs(platform: Platform): void {
  const flagOverdueDueDiligenceJob = new FlagOverdueDueDiligenceJob(platform.commands);

  platform.jobs.register({
    name: 'customer-due-diligence.flag-overdue-due-diligence',
    schedule: { cron: '0 1 * * *', timeZone: 'Europe/Paris' },
    tenancy: 'per-tenant',
    run: (execution) => flagOverdueDueDiligenceJob.run(execution),
  });

  const erasePersonalDataPastRetentionJob = new ErasePersonalDataPastRetentionJob(platform.commands);

  platform.jobs.register({
    name: 'customer-due-diligence.erase-personal-data-past-retention',
    schedule: { cron: '0 3 * * *', timeZone: 'Europe/Paris' },
    tenancy: 'per-tenant',
    run: (execution) => erasePersonalDataPastRetentionJob.run(execution),
  });
}
