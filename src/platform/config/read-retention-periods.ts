import type { RetentionPeriod } from '@ddd-ts-kit/kernel';
import type { Environment } from '@/platform/config/environment';

/** The retention of the personal data each copy keeps, by copy (`identity.invitation`): what the nightly erasure acts on. */
export type RetentionPeriods = Readonly<Record<string, RetentionPeriod>>;

const units = ['days', 'months', 'years'] as const;

/**
 * `RETENTION_PERIODS`, a JSON object from each copy (`<context>.<copy>`) to one unit: `{"identity.invitation":{"days":30}}`,
 * a positive whole number of days, months or years. Owned by data-protection: no period is written in code.
 */
export function readRetentionPeriods(env: Environment): RetentionPeriods {
  const written = env.optional('RETENTION_PERIODS');

  if (written === undefined) {
    env.problem('RETENTION_PERIODS must give the retention of each copy of personal data, as JSON');

    return {};
  }

  return parsePeriods(written, env);
}

function parsePeriods(written: string, env: Environment): RetentionPeriods {
  const parsed = parseJson(written);

  if (!isRecord(parsed)) {
    env.problem('RETENTION_PERIODS must be a JSON object from each copy to its retention');

    return {};
  }

  const periods: Record<string, RetentionPeriod> = {};

  for (const [copy, value] of Object.entries(parsed)) {
    const period = periodOf(value);

    if (period === undefined) {
      env.problem(`RETENTION_PERIODS of ${copy} must be one of days, months or years, a positive whole number`);
    } else {
      periods[copy] = period;
    }
  }

  return periods;
}

function parseJson(written: string): unknown {
  try {
    return JSON.parse(written);
  } catch {
    return undefined;
  }
}

function periodOf(value: unknown): RetentionPeriod | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const given = units.filter((name) => value[name] !== undefined);
  const unit = given.length === 1 ? given[0] : undefined;
  const amount = unit === undefined ? undefined : value[unit];

  if (unit === undefined || typeof amount !== 'number' || !Number.isInteger(amount) || amount <= 0) {
    return undefined;
  }

  return { [unit]: amount };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
