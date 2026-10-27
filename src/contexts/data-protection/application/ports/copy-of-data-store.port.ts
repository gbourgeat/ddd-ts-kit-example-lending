import type { PersonalDataExportDocument, SignedUrl } from '@ddd-ts-kit/kernel';

/**
 * Where the copy of a data subject is kept until it is downloaded: one file of its own, and the
 * link that downloads it, which expires within the hour the kit allows.
 */
export abstract class CopyOfDataStore {
  /** Stores the document as a file and answers a link that downloads it until the link expires. */
  abstract store(document: PersonalDataExportDocument): Promise<SignedUrl>;
}
