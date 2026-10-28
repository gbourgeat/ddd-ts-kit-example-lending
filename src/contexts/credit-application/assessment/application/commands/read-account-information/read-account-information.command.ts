import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Reads the income and expenses of one application from the accounts its applicant consented to share, and keeps them as a document of its file. */
export class ReadAccountInformationCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
  ) {
    super(actor);
  }
}
