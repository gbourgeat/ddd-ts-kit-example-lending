import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** The applicant corrects an earlier entry of one application, by naming the entry and saying why: the actor is the applicant. */
export class CorrectEntryCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
    readonly entryId: string,
    readonly reason: string,
  ) {
    super(actor);
  }
}
