import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** The applicant gives the consent to read their bank accounts for one application: the actor is the applicant. */
export class GiveAccountConsentCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
  ) {
    super(actor);
  }
}
