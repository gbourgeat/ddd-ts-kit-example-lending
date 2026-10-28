import { IsString } from 'class-validator';

export class AttachDocumentAnswer {
  /** The key of the document in the object store: what reading it back takes. */
  @IsString()
  key = '';
}
