import type { FileContent } from '@ddd-ts-kit/kernel';

/** The stored content of one document, as the object store holds it: its metadata, and its bytes as a stream read once. */
export class ReadDocumentResult {
  constructor(readonly content: FileContent) {}
}
