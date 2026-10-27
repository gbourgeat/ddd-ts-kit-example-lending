import { Readable } from 'node:stream';
import {
  MAX_SIGNED_URL_SECONDS,
  type FileStorage,
  type IdGenerator,
  type PersonalDataExportDocument,
  type SignedUrl,
} from '@ddd-ts-kit/kernel';
import type { CopyOfDataStore } from '@/contexts/data-protection/application/ports/copy-of-data-store.port';

/** The largest copy the store writes: beyond it the write fails and leaves nothing under the key. */
const MAX_COPY_BYTES = 100 * 1024 * 1024;

/**
 * The copies kept in the object store: one JSON file per copy, under its customer. The storage keeps
 * the instant each file was written, which is when the copy's retention starts.
 */
export class FileCopyOfDataStore implements CopyOfDataStore {
  constructor(
    private readonly storage: FileStorage,
    private readonly ids: IdGenerator,
  ) {}

  async store(customerId: string, document: PersonalDataExportDocument): Promise<string> {
    const copyId = this.ids.next();
    const content = Readable.from([Buffer.from(JSON.stringify(document, null, 2))]);

    await this.storage.put(keyOf(customerId, copyId), content, {
      mediaType: 'application/json',
      maxBytes: MAX_COPY_BYTES,
    });

    return copyId;
  }

  async storedAt(customerId: string, copyId: string): Promise<Date | undefined> {
    const metadata = await this.storage.stat(keyOf(customerId, copyId));

    return metadata?.lastModified;
  }

  link(customerId: string, copyId: string): Promise<SignedUrl> {
    return this.storage.signedDownloadUrl(keyOf(customerId, copyId), {
      expiresInSeconds: MAX_SIGNED_URL_SECONDS,
      fileName: 'copy-of-data.json',
    });
  }

  async remove(customerId: string, copyId: string): Promise<void> {
    await this.storage.delete(keyOf(customerId, copyId));
  }
}

function keyOf(customerId: string, copyId: string): string {
  return `personal-data-copies/${customerId}/${copyId}.json`;
}
