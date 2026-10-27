import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Appoints a member of staff to a branch: the staff member is born on the branch, so the use case is on the context. */
export class AppointStaffMemberCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly branchId: string,
    readonly name: string,
    readonly email: string,
    readonly accountId: string,
    readonly ownCustomerId?: string,
  ) {
    super(actor);
  }
}
