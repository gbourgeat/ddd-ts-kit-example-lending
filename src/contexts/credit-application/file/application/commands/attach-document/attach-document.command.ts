import { AuthorizedCommand, FileUpload, type Actor, type ReceivedFile } from '@ddd-ts-kit/kernel';

/** The applicant attaches one document to one application: the file is staged by the bus before the transaction opens. */
export class AttachDocumentCommand extends AuthorizedCommand<string> {
  /** Staged by the bus under a key of its area before the transaction opens: the handler reads `upload.file`. */
  readonly upload: FileUpload;

  constructor(
    actor: Actor,
    readonly applicationId: string,
    file: ReceivedFile,
  ) {
    super(actor);
    this.upload = new FileUpload(file, 'attach-document');
  }
}
