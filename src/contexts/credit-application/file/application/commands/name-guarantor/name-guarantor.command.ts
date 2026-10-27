import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** The applicant names a person as the guarantor of one application: the actor is the applicant. */
export class NameGuarantorCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
    readonly guarantorId: string,
  ) {
    super(actor);
  }
}
