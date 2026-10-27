import { Readable } from 'node:stream';
import {
  MAX_SIGNED_URL_SECONDS,
  type FileKeys,
  type FileStorage,
  type PersonalDataExportDocument,
  type SignedUrl,
} from '@ddd-ts-kit/kernel';
import type { CopyOfDataStore } from '@/contexts/data-protection/application/ports/copy-of-data-store.port';

/** The largest copy the store writes: beyond it the write fails and leaves nothing under the key. */
const MAX_COPY_BYTES = 100 * 1024 * 1024;

/**
 * The copy kept in the object store: one JSON file under a key generated on the server, downloaded
 * through a signed link of the longest lifetime the kit allows.
 */
export class FileCopyOfDataStore implements CopyOfDataStore {
  constructor(
    private readonly storage: FileStorage,
    private readonly keys: FileKeys,
  ) {}

  async store(document: PersonalDataExportDocument): Promise<SignedUrl> {
    const key = this.keys.next('personal-data-copies');
    const content = Readable.from([Buffer.from(JSON.stringify(document, null, 2))]);

    await this.storage.put(key, content, { mediaType: 'application/json', maxBytes: MAX_COPY_BYTES });

    return this.storage.signedDownloadUrl(key, {
      expiresInSeconds: MAX_SIGNED_URL_SECONDS,
      fileName: 'copy-of-data.json',
    });
  }
}
