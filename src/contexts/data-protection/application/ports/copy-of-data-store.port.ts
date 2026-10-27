import type { PersonalDataExportDocument, SignedUrl } from '@ddd-ts-kit/kernel';

/**
 * Where the copy of a data subject is kept for its retention: one file per copy, under the customer,
 * named by its identifier. The copy is deleted once its retention is over.
 */
export abstract class CopyOfDataStore {
  /** Stores the document as one copy of the customer, and answers the identifier of the copy. */
  abstract store(customerId: string, document: PersonalDataExportDocument): Promise<string>;

  /** When the copy was stored, or undefined when no copy is kept under this identifier. */
  abstract storedAt(customerId: string, copyId: string): Promise<Date | undefined>;

  /** The signed link that downloads the copy, which expires within the hour the kit allows. */
  abstract link(customerId: string, copyId: string): Promise<SignedUrl>;

  /** Deletes the copy. */
  abstract remove(customerId: string, copyId: string): Promise<void>;
}
