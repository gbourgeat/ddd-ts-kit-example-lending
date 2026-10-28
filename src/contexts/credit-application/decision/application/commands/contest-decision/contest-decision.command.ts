import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** The applicant contests the decision on the application, with the written point of view: the file goes before a person. */
export class ContestDecisionCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
    readonly reason: string,
  ) {
    super(actor);
  }
}
