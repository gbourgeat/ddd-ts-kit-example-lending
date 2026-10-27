import { describe, expect, it } from '@jest/globals';
import { PlatformPersonalDataPurge } from '@/contexts/data-protection/infrastructure/platform/platform-personal-data-purge';

describe('Platform personal data purge', () => {
  it('answers the rows that every copy of the platform purged', async () => {
    const purge = new PlatformPersonalDataPurge(async () => ({ purged: { identity: 2, 'branch-network': 3 } }));

    await expect(purge.purgeExpired()).resolves.toBe(5);
  });

  it('answers zero when no copy held a row past its retention', async () => {
    const purge = new PlatformPersonalDataPurge(async () => ({ purged: {} }));

    await expect(purge.purgeExpired()).resolves.toBe(0);
  });
});
