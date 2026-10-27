import type { PersonalDataExportDocument, SignedUrl } from '@ddd-ts-kit/kernel';
import type { CopyOfDataStore } from '@/contexts/data-protection/application/ports/copy-of-data-store.port';

/** The copies of the tests: each stored copy keeps the instant it was stored, and the copies removed are not kept. */
export class FakeCopyOfDataStore implements CopyOfDataStore {
  readonly stored: PersonalDataExportDocument[] = [];
  private readonly copies = new Map<string, { customerId: string; storedAt: Date }>();
  private readonly clock: () => Date;

  constructor(clock: () => Date = () => new Date('2026-10-27T08:00:00.000Z')) {
    this.clock = clock;
  }

  async store(customerId: string, document: PersonalDataExportDocument): Promise<string> {
    this.stored.push(document);

    const copyId = `copy-${this.stored.length}`;

    this.copies.set(copyId, { customerId, storedAt: this.clock() });

    return copyId;
  }

  async storedAt(customerId: string, copyId: string): Promise<Date | undefined> {
    const copy = this.copies.get(copyId);

    return copy?.customerId === customerId ? copy.storedAt : undefined;
  }

  async link(customerId: string, copyId: string): Promise<SignedUrl> {
    return {
      url: `https://files.example.test/${customerId}/${copyId}?token=t`,
      expiresAt: new Date(this.clock().getTime() + 60 * 60 * 1000),
    };
  }

  async remove(customerId: string, copyId: string): Promise<void> {
    if (this.copies.get(copyId)?.customerId === customerId) {
      this.copies.delete(copyId);
    }
  }
}
