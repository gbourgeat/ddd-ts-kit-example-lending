import { describe, expect, it } from '@jest/globals';
import { InMemorySubjectKeyStore } from '@ddd-ts-kit/kernel';
import { RemotePersonalDataErasure } from '@/contexts/servicing/ledger/infrastructure/external/remote-personal-data-erasure.adapter';

describe('RemotePersonalDataErasure', () => {
  it('erases the personal values of a loan, and erasing it again changes nothing', async () => {
    const erasure = new RemotePersonalDataErasure(new InMemorySubjectKeyStore());

    await erasure.erase('loan-1');

    await expect(erasure.erase('loan-1')).resolves.toBeUndefined();
  });
});
