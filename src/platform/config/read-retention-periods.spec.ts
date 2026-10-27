import { describe, expect, it } from '@jest/globals';
import { Environment } from '@/platform/config/environment';
import { readRetentionPeriods } from '@/platform/config/read-retention-periods';

describe('readRetentionPeriods', () => {
  it('reads each copy with its one unit, in days, months or years', () => {
    const env = envWith(
      '{"identity.invitation":{"days":30},"credit-application.refused":{"months":6},"servicing.loan":{"years":10}}',
    );

    expect(readRetentionPeriods(env)).toEqual({
      'identity.invitation': { days: 30 },
      'credit-application.refused': { months: 6 },
      'servicing.loan': { years: 10 },
    });

    expect(env.problems).toEqual([]);
  });

  it('names the variable when it is left out, so the application refuses to start', () => {
    const env = new Environment({});

    readRetentionPeriods(env);

    expect(env.problems).toEqual([expect.stringContaining('RETENTION_PERIODS must give')]);
  });

  it('refuses a text that is not JSON', () => {
    const env = envWith('days=30');

    readRetentionPeriods(env);

    expect(env.problems).toEqual(['RETENTION_PERIODS must be a JSON object from each copy to its retention']);
  });

  it.each([
    ['no unit', '{"identity.invitation":{}}'],
    ['two units', '{"identity.invitation":{"days":30,"months":1}}'],
    ['zero', '{"identity.invitation":{"days":0}}'],
    ['a fraction', '{"identity.invitation":{"years":1.5}}'],
  ])('refuses a period with %s', (_case, written) => {
    const env = envWith(written);

    readRetentionPeriods(env);

    expect(env.problems).toEqual([expect.stringContaining('identity.invitation')]);
  });
});

function envWith(written: string): Environment {
  return new Environment({ RETENTION_PERIODS: written });
}
