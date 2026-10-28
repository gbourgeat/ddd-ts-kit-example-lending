import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** The applicant asks for a human review of the refusal standing on the application, proposed or decided. */
export class RequestHumanReviewCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
  ) {
    super(actor);
  }
}
