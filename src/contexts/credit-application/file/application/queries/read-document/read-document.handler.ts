import type { FileStorage, QueryHandler } from '@ddd-ts-kit/kernel';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';
import { UnknownEntry } from '@/contexts/credit-application/file/domain/errors/unknown-entry.error';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { ReadDocumentQuery } from '@/contexts/credit-application/file/application/queries/read-document/read-document.query';
import { ReadDocumentResult } from '@/contexts/credit-application/file/application/queries/read-document/read-document.result';

/** A document is read only when the file holds its key: the content is read from the object store, never from another application. */
export class ReadDocumentHandler implements QueryHandler<ReadDocumentQuery> {
  constructor(
    private readonly creditApplicationRepository: CreditApplicationRepository,
    private readonly storage: FileStorage,
  ) {}

  async execute(query: ReadDocumentQuery): Promise<ReadDocumentResult> {
    const creditApplication = await this.creditApplicationRepository.findById(query.applicationId);

    if (creditApplication === undefined) {
      throw UnknownCreditApplication.forCreditApplication(query.applicationId);
    }

    if (!creditApplication.documentKeys.includes(query.documentKey)) {
      throw UnknownEntry.forEntry(query.documentKey);
    }

    const file = await this.storage.get(query.documentKey);

    if (file === undefined) {
      throw UnknownEntry.forEntry(query.documentKey);
    }

    return new ReadDocumentResult(file);
  }
}
