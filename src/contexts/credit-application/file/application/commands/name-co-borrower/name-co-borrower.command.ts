import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** The applicant names a person as the co-borrower of one application: the actor is the applicant. */
export class NameCoBorrowerCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
    readonly coBorrowerId: string,
  ) {
    super(actor);
  }
}
