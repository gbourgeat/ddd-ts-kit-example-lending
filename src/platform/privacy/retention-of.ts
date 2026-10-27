import type { RetentionPeriod } from '@ddd-ts-kit/kernel';
import type { RetentionPeriods } from '@/platform/config/read-retention-periods';

/** The retention of one copy, from the configuration: refused when none is given, so no copy purges by a guess. */
export function retentionOf(retention: RetentionPeriods, copy: string): RetentionPeriod {
  const period = retention[copy];

  if (period === undefined) {
    throw new Error(`RETENTION_PERIODS gives no retention for ${copy}`);
  }

  return period;
}
