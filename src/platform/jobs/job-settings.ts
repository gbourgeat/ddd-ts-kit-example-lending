import type { JobSettings } from '@ddd-ts-kit/kernel';

type Environment = Readonly<Record<string, string | undefined>>;

/** The contexts run as services of their own (`ddd-ts-kit generate service`): the whole application schedules none of their jobs. */
const extracted: readonly string[] = [
  // ddd-ts-kit:extracted
  'servicing',
  // /ddd-ts-kit:extracted
];

/**
 * What configuration changes of each scheduled job, by job name: a job is switched off in one
 * environment with `JOB_<CONTEXT>_<JOB>_ENABLED=false`, never by a code change.
 * `ddd-ts-kit generate job` adds a line; a schedule or a timeout read from the environment goes
 * on the same line. The wiring refuses the settings of a job no module declares (`UNKNOWN_JOB`), so each
 * process is given those of the jobs it registers: a service that hosts one context is given a context
 * and keeps its jobs only (the jobs of the platform run in the whole application); the whole application
 * is given none, and leaves out the jobs of the contexts run as services of their own.
 */
export function jobSettings(environment: Environment, context?: string): Readonly<Record<string, JobSettings>> {
  const settings: Readonly<Record<string, JobSettings>> = {
    'audit.archive': { enabled: environment['JOB_AUDIT_ARCHIVE_ENABLED'] !== 'false' },
    'privacy.purge-expired': { enabled: environment['JOB_PRIVACY_PURGE_EXPIRED_ENABLED'] !== 'false' },
    // ddd-ts-kit:jobs
    'brokerage.check-registration': { enabled: environment['JOB_BROKERAGE_CHECK_REGISTRATION_ENABLED'] !== 'false' },
    // /ddd-ts-kit:jobs
  };

  if (context === undefined) {
    return Object.fromEntries(
      Object.entries(settings).filter(([name]) => !extracted.some((hosted) => name.startsWith(hosted + '.'))),
    );
  }

  return Object.fromEntries(Object.entries(settings).filter(([name]) => name.startsWith(context + '.')));
}
