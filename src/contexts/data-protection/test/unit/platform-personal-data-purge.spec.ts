import { describe, expect, it } from '@jest/globals';
import { PlatformPersonalDataPurge } from '@/contexts/data-protection/infrastructure/external/platform-personal-data-purge';

const asOf = new Date('2026-01-01T07:00:00.000Z');

describe('Platform personal data purge', () => {
  it('answers the rows that every copy of the platform purged', async () => {
    const purge = new PlatformPersonalDataPurge(async () => ({ purged: { identity: 2, 'branch-network': 3 } }));

    await expect(purge.purgeExpired(asOf)).resolves.toBe(5);
  });

  it('answers zero when no copy held a row past its retention', async () => {
    const purge = new PlatformPersonalDataPurge(async () => ({ purged: {} }));

    await expect(purge.purgeExpired(asOf)).resolves.toBe(0);
  });

  it('runs the platform purge as of the instant it is given, never the clock', async () => {
    const instants: Date[] = [];

    const purge = new PlatformPersonalDataPurge(async (at) => {
      instants.push(at);

      return { purged: {} };
    });

    await purge.purgeExpired(asOf);

    expect(instants).toEqual([asOf]);
  });
});
