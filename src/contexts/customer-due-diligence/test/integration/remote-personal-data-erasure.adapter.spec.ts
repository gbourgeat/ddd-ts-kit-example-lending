import { describe, expect, it } from '@jest/globals';
import { InMemorySubjectKeyStore } from '@ddd-ts-kit/kernel';
import { RemotePersonalDataErasure } from '@/contexts/customer-due-diligence/infrastructure/external/remote-personal-data-erasure.adapter';

const customerId = '6f1c2c1e-0000-4000-8000-000000000001';

describe('RemotePersonalDataErasure', () => {
  it('destroys the key the personal values of the customer are sealed with', async () => {
    const keys = new InMemorySubjectKeyStore();
    const key = await keys.keyFor(customerId);
    const adapter = new RemotePersonalDataErasure(keys);

    await adapter.erase(customerId);

    expect(await keys.find(key.id)).toBeUndefined();
  });

  it('erases a customer again without failing when its key is already destroyed', async () => {
    const adapter = new RemotePersonalDataErasure(new InMemorySubjectKeyStore());

    await expect(adapter.erase(customerId)).resolves.toBeUndefined();
  });
});
