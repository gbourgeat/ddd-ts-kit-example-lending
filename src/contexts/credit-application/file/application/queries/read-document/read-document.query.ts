import { AuthorizedQuery, type Actor } from '@ddd-ts-kit/kernel';
import type { ReadDocumentResult } from '@/contexts/credit-application/file/application/queries/read-document/read-document.result';

/** One document of one application, read back by its key: the key the attachment answered with. */
export class ReadDocumentQuery extends AuthorizedQuery<ReadDocumentResult> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
    readonly documentKey: string,
  ) {
    super(actor);
  }
}
