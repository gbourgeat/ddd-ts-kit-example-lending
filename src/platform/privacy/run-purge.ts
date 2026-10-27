import { auditedPersonalDataRetention } from '@ddd-ts-kit/audit';
import {
  isPersonalDataRetention,
  purgeExpiredPersonalData,
  type PersonalDataPurgeReport,
  type PersonalDataRetention,
} from '@ddd-ts-kit/kernel';
import type { Platform } from '@/platform/composition/platform';
import { dataSubjectCopies } from '@/platform/privacy/data-subject-copies';

/**
 * The storage limitation of the application (GDPR article 5(1)(e)): every copy listed in
 * `data-subject-copies.ts` purges the rows that outlived the retention their declaration gives,
 * deleted or pseudonymised as it says, in every tenant: the work of the job names none, and a
 * tenant left out of a list would keep what it should not; each purge writes its entry to the audit
 * trail, the number of rows and no person. Run every night by the job `privacy.purge-expired` and by
 * `npm run privacy:purge`, each in an execution context of its own. A copy that fails does not stop
 * the others; the next run completes it.
 */
export function runPurge(platform: Platform, asOf: Date = platform.clock.now()): Promise<PersonalDataPurgeReport> {
  const retentions = dataSubjectCopies.map((copy) => copy(platform)).filter(isPersonalDataRetention);
  const source = { scope: platform.scope, clock: platform.clock, ids: platform.ids };

  const audited = (port: PersonalDataRetention): PersonalDataRetention =>
    auditedPersonalDataRetention(port, platform.audit.trail, source);

  return purgeExpiredPersonalData(asOf, retentions.map(audited));
}
