import { describe, expect, it } from '@jest/globals';
import { InMemoryFileStorage, type IdGenerator } from '@ddd-ts-kit/kernel';
import { FileCopyOfDataStore } from '@/contexts/data-protection/infrastructure/external/file-copy-of-data-store';

const ONE_HOUR_MS = 60 * 60 * 1000;
const document = { subject: 'customer-1', sections: [] } as never;
const ids: IdGenerator = { next: () => 'copy-1' };

describe('File copy of data store', () => {
  it('stores the copy of a customer and answers its identifier', async () => {
    const copies = new FileCopyOfDataStore(new InMemoryFileStorage(), ids);

    const copyId = await copies.store('customer-1', document);

    expect(copyId).toBe('copy-1');
  });

  it('answers when the copy was stored, for the customer it belongs to', async () => {
    const copies = new FileCopyOfDataStore(new InMemoryFileStorage(), ids);

    await copies.store('customer-1', document);

    const storedAt = await copies.storedAt('customer-1', 'copy-1');

    expect(storedAt).toBeInstanceOf(Date);
  });

  it('answers no date for a copy that was never stored', async () => {
    const copies = new FileCopyOfDataStore(new InMemoryFileStorage(), ids);

    const storedAt = await copies.storedAt('customer-1', 'copy-1');

    expect(storedAt).toBeUndefined();
  });

  it('answers a link that downloads the copy for one hour', async () => {
    const copies = new FileCopyOfDataStore(new InMemoryFileStorage(), ids);

    await copies.store('customer-1', document);

    const link = await copies.link('customer-1', 'copy-1');

    expect(link.expiresAt.getTime() - Date.now()).toBeLessThanOrEqual(ONE_HOUR_MS);
  });

  it('removes the copy, which no longer has a date of storage', async () => {
    const copies = new FileCopyOfDataStore(new InMemoryFileStorage(), ids);

    await copies.store('customer-1', document);

    await copies.remove('customer-1', 'copy-1');

    expect(await copies.storedAt('customer-1', 'copy-1')).toBeUndefined();
  });
});
