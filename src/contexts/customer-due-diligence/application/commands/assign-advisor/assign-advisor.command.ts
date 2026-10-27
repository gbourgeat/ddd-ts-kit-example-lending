import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Gives a customer its advisor: the advisor of the branch network who looks after the customer. */
export class AssignAdvisorCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly customerId: string,
    readonly advisorId: string,
  ) {
    super(actor);
  }
}
