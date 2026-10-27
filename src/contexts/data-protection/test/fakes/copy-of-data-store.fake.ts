import type { PersonalDataExportDocument, SignedUrl } from '@ddd-ts-kit/kernel';
import type { CopyOfDataStore } from '@/contexts/data-protection/application/ports/copy-of-data-store.port';

export class FakeCopyOfDataStore implements CopyOfDataStore {
  readonly stored: PersonalDataExportDocument[] = [];

  async store(document: PersonalDataExportDocument): Promise<SignedUrl> {
    this.stored.push(document);

    return {
      url: `https://files.example.test/copies/${this.stored.length}`,
      expiresAt: new Date('2026-10-27T01:00:00.000Z'),
    };
  }
}
